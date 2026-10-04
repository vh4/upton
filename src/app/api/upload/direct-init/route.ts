import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateUploadedFile } from '@/lib/validation/mime';
import { calculateExpirationDate } from '@/lib/expiration/calc';
import {
  isSupabaseStorageEnabled,
  getStorageBucketName,
  getSupabaseStorageClient,
  autoResetStorageIfExceeded,
} from '@/lib/storage';
import { generateStoredFilename } from '@/lib/storage/local';
import { ExpirationPreset, CustomExpirationUnit } from '@/types/file';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      filename,
      fileType,
      fileSize,
      expirationPreset = '24h',
      customValue,
      customUnit = 'hours',
    } = body;

    if (!filename || !fileSize) {
      return NextResponse.json(
        { error: 'Filename and fileSize are required.' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateUploadedFile(filename, fileType, fileSize);
    if (!validation.valid || !validation.sanitizedName || !validation.ext) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file format or size.' },
        { status: 400 }
      );
    }

    // Check 1GB storage limit and auto-reset if full
    await autoResetStorageIfExceeded(fileSize);

    // If local storage mode, notify frontend to use multipart upload to /api/upload
    if (!isSupabaseStorageEnabled()) {
      return NextResponse.json({ mode: 'local' });
    }

    const supabase = getSupabaseStorageClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client is not configured on server.' },
        { status: 500 }
      );
    }

    const bucket = getStorageBucketName();
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const storedName = generateStoredFilename(validation.ext);
    const storageKey = `${year}/${month}/${storedName}`;

    const expiresAtDate = calculateExpirationDate({
      preset: expirationPreset as ExpirationPreset,
      customValue: customValue ? parseInt(customValue, 10) : undefined,
      customUnit: customUnit as CustomExpirationUnit,
    });
    const expiresAtIso = expiresAtDate ? expiresAtDate.toISOString() : null;

    const fileId = crypto.randomUUID();
    const deleteToken = crypto.randomBytes(24).toString('hex');

    // Create signed upload URL from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(storageKey);

    if (error || !data) {
      console.warn('[upload:direct-init] Failed to create signed upload URL:', error?.message);
      return NextResponse.json(
        { error: `Gagal membuat upload URL Supabase: ${error?.message || 'Bucket not found'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mode: 'supabase',
      fileId,
      storedName,
      storageKey,
      filePath: `supabase://${bucket}/${storageKey}`,
      uploadUrl: data.signedUrl,
      token: data.token,
      deleteToken,
      expiresAt: expiresAtIso,
      sanitizedName: validation.sanitizedName,
      mimeType: fileType,
      fileSize,
    });
  } catch (err: any) {
    console.error('[upload:direct-init] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
