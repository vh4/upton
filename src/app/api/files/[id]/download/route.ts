import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getFileById, incrementDownloadCount } from '@/lib/db';
import { getUploadBaseDir, assertSafePath } from '@/lib/storage/local';
import path from 'path';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const record = await getFileById(id);
    if (!record || record.status !== 'active') {
      return new NextResponse('File not found or expired', { status: 404 });
    }

    if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
      return new NextResponse('File has expired', { status: 410 });
    }

    const fullPath = assertSafePath(path.join(getUploadBaseDir(), record.file_path));
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Physical file not found', { status: 404 });
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;

    // Increment download counter asynchronously in database
    incrementDownloadCount(record.id).catch((err) =>
      console.warn(`[download] Failed to increment count for ${record.id}:`, err)
    );

    const fileStream = fs.createReadStream(fullPath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    // Encode filename for safe Content-Disposition header
    const encodedFilename = encodeURIComponent(record.original_name);

    return new NextResponse(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': record.mime_type,
        'Content-Length': fileSize.toString(),
        'Content-Disposition': `attachment; filename="${record.original_name.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[download] Error serving download:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
