import { NextRequest, NextResponse } from 'next/server';
import { getFilesByIds, toPublicFile } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ files: [] }, { status: 200 });
    }

    // Limit batch query size to 100
    const limitedIds = ids.slice(0, 100);
    const records = await getFilesByIds(limitedIds);

    const publicFiles = records
      .filter((r) => r.status === 'active')
      .map(toPublicFile);

    return NextResponse.json({ files: publicFiles }, { status: 200 });
  } catch (error: any) {
    console.error('[files:batch] Error retrieving batch:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file history.' },
      { status: 500 }
    );
  }
}
