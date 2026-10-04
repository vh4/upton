import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredFiles } from '@/lib/cleanup/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.CRON_SECRET;

    if (configuredSecret) {
      const authHeader = request.headers.get('authorization');
      const providedSecret =
        authHeader?.replace(/bearer\s+/i, '') ||
        request.nextUrl.searchParams.get('secret');

      if (providedSecret !== configuredSecret) {
        return NextResponse.json(
          { error: 'Unauthorized. Invalid cleanup secret.' },
          { status: 401 }
        );
      }
    }

    const result = await cleanupExpiredFiles();

    return NextResponse.json(
      {
        success: true,
        message: 'Cleanup job completed successfully.',
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[api:cleanup] Error running cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup job encountered an internal error.' },
      { status: 500 }
    );
  }
}

// Allow GET for Vercel Cron integration
export async function GET(request: NextRequest) {
  return POST(request);
}
