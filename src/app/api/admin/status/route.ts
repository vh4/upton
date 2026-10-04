import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/admin/auth';
import { getStorageMetrics, getAllFiles } from '@/lib/db';
import { getMaxStorageBytes } from '@/lib/storage/limits';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Silakan login sebagai admin terlebih dahulu.' },
      { status: 401 }
    );
  }

  try {
    const maxBytes = getMaxStorageBytes();
    const metrics = await getStorageMetrics(maxBytes);
    const files = await getAllFiles();

    // Map files for safe display in table
    const safeFiles = files.map((f) => ({
      id: f.id,
      original_name: f.original_name,
      file_size: Number(f.file_size),
      mime_type: f.mime_type,
      created_at: f.created_at,
      expires_at: f.expires_at,
      status: f.status,
      public_url: f.public_url,
      is_expired: f.expires_at ? new Date(f.expires_at).getTime() < Date.now() : false,
      is_permanent: !f.expires_at,
    }));

    return NextResponse.json({
      success: true,
      metrics,
      files: safeFiles,
    });
  } catch (err: any) {
    console.error('[admin:status] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal mengambil status storage.' },
      { status: 500 }
    );
  }
}
