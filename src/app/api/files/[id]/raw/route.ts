import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getFileById } from '@/lib/db';
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
      return new NextResponse('File not found on storage', { status: 404 });
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    // Handle HTTP Byte-Range requests (crucial for video streaming)
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(fullPath, { start, end });

      // Convert Node readable stream to Web ReadableStream
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

      return new NextResponse(webStream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': record.mime_type,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Full file stream
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

    return new NextResponse(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': record.mime_type,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[raw] Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
