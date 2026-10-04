import { NextRequest, NextResponse } from 'next/server';
import { insertFileRecord, toPublicFile } from '@/lib/db';
import { isSupabaseStorageEnabled } from '@/lib/storage/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fileId,
      originalName,
      storedName,
      mimeType,
      fileSize,
      filePath,
      expiresAt,
      deleteToken,
    } = body;

    if (!fileId || !originalName || !storedName || !filePath || !deleteToken) {
      return NextResponse.json(
        { error: 'Missing required file metadata fields.' },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      'http://localhost:3000';

    const publicUrl = `${appUrl}/f/${fileId}`;

    const record = await insertFileRecord({
      id: fileId,
      original_name: originalName,
      stored_name: storedName,
      mime_type: (mimeType || 'application/octet-stream').toLowerCase(),
      file_size: typeof fileSize === 'number' ? fileSize : parseInt(fileSize, 10) || 0,
      file_path: filePath,
      public_url: publicUrl,
      expires_at: expiresAt || null,
      delete_token: deleteToken,
      width: null,
      height: null,
      duration: null,
    });

    return NextResponse.json(
      {
        success: true,
        file: toPublicFile(record),
        delete_token: deleteToken,
        manage_url: `${appUrl}/f/${record.id}/manage?token=${deleteToken}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[upload:direct-complete] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete direct upload.' },
      { status: 500 }
    );
  }
}
