import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getFileById, incrementDownloadCount } from '@/lib/db';
import {
  getUploadBaseDir,
  assertSafePath,
  parseStoragePath,
  isSupabaseStorageEnabled,
  getSupabaseFileUrl,
  isSupabaseConfigured,
} from '@/lib/storage';

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

    // Increment download counter asynchronously in database
    incrementDownloadCount(record.id).catch((err) =>
      console.warn(`[download] Failed to increment count for ${record.id}:`, err)
    );

    const parsed = parseStoragePath(record.file_path);

    // 1. If stored in Supabase or running in Supabase Storage mode (Vercel)
    if (parsed.isSupabase || isSupabaseStorageEnabled()) {
      const downloadUrl = await getSupabaseFileUrl(record.file_path, {
        download: record.original_name,
      });
      if (downloadUrl) {
        return NextResponse.redirect(downloadUrl, { status: 302 });
      }
    }

    // 2. Check local disk
    try {
      const fullPath = assertSafePath(path.join(getUploadBaseDir(), record.file_path));
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        const fileSize = stat.size;

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
      }
    } catch {
      // Local path check threw or file does not exist locally
    }

    // 3. Fallback: Check if file is available in Supabase
    if (isSupabaseConfigured()) {
      const downloadUrl = await getSupabaseFileUrl(record.file_path, {
        download: record.original_name,
      });
      if (downloadUrl) {
        return NextResponse.redirect(downloadUrl, { status: 302 });
      }
    }

    return new NextResponse('Physical file not found', { status: 404 });
  } catch (error: any) {
    console.error('[download] Error serving download:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
