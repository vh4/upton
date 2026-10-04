import { NextRequest, NextResponse } from 'next/server';
import { getFileById, deleteFileRecord, toPublicFile } from '@/lib/db';
import { deleteLocalFile, getPhysicalFileStat } from '@/lib/storage/local';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const record = await getFileById(id);
    if (!record || record.status !== 'active') {
      return NextResponse.json(
        { error: 'File not found or no longer available.' },
        { status: 404 }
      );
    }

    // Check expiration
    if (record.expires_at) {
      const isExpired = new Date(record.expires_at).getTime() < Date.now();
      if (isExpired) {
        // Asynchronously cleanup expired file
        deleteLocalFile(record.file_path).catch(() => {});
        return NextResponse.json(
          {
            error: 'This file has expired.',
            expired: true,
          },
          { status: 410 }
        );
      }
    }

    // Verify physical file exists
    const fileStat = await getPhysicalFileStat(record.file_path);
    if (!fileStat) {
      return NextResponse.json(
        { error: 'The requested file could not be found on storage.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        file: toPublicFile(record),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[files:get] Error retrieving file:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file details.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Retrieve token from header, query, or body
    let token = request.headers.get('x-delete-token');
    if (!token) {
      token = request.nextUrl.searchParams.get('token');
    }
    if (!token) {
      try {
        const body = await request.json();
        token = body?.token;
      } catch {
        // No body
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Delete token is required to delete this file.' },
        { status: 401 }
      );
    }

    const record = await getFileById(id);
    if (!record) {
      return NextResponse.json(
        { error: 'File not found.' },
        { status: 404 }
      );
    }

    if (record.delete_token !== token) {
      return NextResponse.json(
        { error: 'Invalid delete token. Authorization denied.' },
        { status: 403 }
      );
    }

    // Delete physical file
    await deleteLocalFile(record.file_path);

    // Delete from database
    await deleteFileRecord(record.id, token);

    return NextResponse.json(
      {
        success: true,
        message: 'File successfully deleted.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[files:delete] Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file.' },
      { status: 500 }
    );
  }
}
