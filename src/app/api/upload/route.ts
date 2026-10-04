import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateUploadedFile } from '@/lib/validation/mime';
import { saveLocalFile } from '@/lib/storage/local';
import { calculateExpirationDate } from '@/lib/expiration/calc';
import { insertFileRecord, toPublicFile } from '@/lib/db';
import { ExpirationPreset, CustomExpirationUnit, UploadedFileResponse } from '@/types/file';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 1. Parse expiration settings
    const preset = (formData.get('expirationPreset') as ExpirationPreset) || '24h';
    const customValue = formData.get('customValue')
      ? parseInt(formData.get('customValue') as string, 10)
      : undefined;
    const customUnit = (formData.get('customUnit') as CustomExpirationUnit) || 'hours';

    const expiresAtDate = calculateExpirationDate({
      preset,
      customValue,
      customUnit,
    });
    const expiresAtIso = expiresAtDate ? expiresAtDate.toISOString() : null;

    // 2. Collect files from form data
    const files: File[] = [];
    const entries = formData.getAll('files');
    if (entries.length > 0) {
      for (const entry of entries) {
        if (entry instanceof File && entry.size > 0) {
          files.push(entry);
        }
      }
    }

    // Also check single 'file' field
    const singleFile = formData.get('file');
    if (singleFile instanceof File && singleFile.size > 0) {
      if (!files.some((f) => f.name === singleFile.name && f.size === singleFile.size)) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided for upload.' },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      'http://localhost:3000';

    const uploadedResults: UploadedFileResponse[] = [];
    const errors: Array<{ filename: string; error: string }> = [];

    // 3. Process each file
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract first 16 bytes for magic bytes verification
      const headerSnippet = buffer.subarray(0, 16);

      // Validate file
      const validation = validateUploadedFile(
        file.name,
        file.type,
        file.size,
        headerSnippet
      );

      if (!validation.valid || !validation.sanitizedName || !validation.ext) {
        errors.push({
          filename: file.name,
          error: validation.error || 'File validation failed',
        });
        continue;
      }

      // Save to local filesystem in date partition
      const saved = await saveLocalFile(buffer, validation.ext);

      // Generate secure delete token
      const deleteToken = crypto.randomBytes(24).toString('hex');

      // Generate public URL
      // We will assign the public URL once record is inserted or use UUID
      const fileId = crypto.randomUUID();
      const publicUrl = `${appUrl}/f/${fileId}`;

      // Insert record to database
      const record = await insertFileRecord({
        original_name: validation.sanitizedName,
        stored_name: saved.storedName,
        mime_type: file.type.toLowerCase(),
        file_size: saved.fileSize,
        file_path: saved.relativePath,
        public_url: publicUrl,
        expires_at: expiresAtIso,
        delete_token: deleteToken,
        width: null,
        height: null,
        duration: null,
      });

      uploadedResults.push({
        file: toPublicFile(record),
        delete_token: deleteToken,
        manage_url: `${appUrl}/f/${record.id}/manage?token=${deleteToken}`,
      });
    }

    if (uploadedResults.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].error, details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        files: uploadedResults,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[upload] Unexpected upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the upload.' },
      { status: 500 }
    );
  }
}
