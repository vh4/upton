import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/admin/auth';
import { executeStorageReset } from '@/lib/storage/reset';
import { cleanupExpiredFiles } from '@/lib/cleanup/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Hanya admin yang diizinkan mereset storage.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { mode = 'all' } = body;

    if (mode === 'expired') {
      const cleanupResult = await cleanupExpiredFiles();
      return NextResponse.json({
        success: true,
        mode: 'expired',
        message: `Pembersihan berhasil. ${cleanupResult.recordsDeleted} file expired telah dihapus dari storage.`,
        deletedCount: cleanupResult.recordsDeleted,
      });
    }

    // Default mode: 'all' (Full Storage Reset)
    const resetResult = await executeStorageReset();

    return NextResponse.json({
      success: true,
      mode: 'all',
      message: resetResult.message,
      deletedCount: resetResult.deletedFilesCount,
      freedBytes: resetResult.freedBytes,
      timestamp: resetResult.timestamp,
    });
  } catch (err: any) {
    console.error('[admin:reset] Error executing reset:', err);
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan saat mengeksekusi reset storage.' },
      { status: 500 }
    );
  }
}
