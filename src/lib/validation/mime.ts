import path from 'path';

export const DEFAULT_ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
] as const;

export const MIME_TO_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/svg+xml': ['.svg'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  'video/x-matroska': ['.mkv'],
};

export function getAllowedMimeTypes(): string[] {
  const envMimes = process.env.ALLOWED_MIME_TYPES;
  if (envMimes) {
    return envMimes.split(',').map((m) => m.trim().toLowerCase()).filter(Boolean);
  }
  return [...DEFAULT_ALLOWED_MIME_TYPES];
}

export function getMaxFileSizeMb(): number {
  const envLimit = process.env.MAX_FILE_SIZE_MB;
  if (envLimit) {
    const parsed = parseInt(envLimit, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 500; // Default 500 MB
}

export function getMaxFileSizeBytes(): number {
  return getMaxFileSizeMb() * 1024 * 1024;
}

/**
 * Strips dangerous characters and path traversal indicators from filename.
 */
export function sanitizeFilename(originalName: string): string {
  // Remove path traversal elements
  const basename = path.basename(originalName);
  // Remove null bytes and control characters
  let clean = basename.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  // Replace slashes and backslashes
  clean = clean.replace(/[/\\?%*:|"<>]/g, '_');
  // Trim spaces and dots
  clean = clean.trim().replace(/^\.+/, '');
  if (!clean) {
    clean = 'file_' + Date.now();
  }
  // Limit length
  if (clean.length > 120) {
    const ext = path.extname(clean);
    clean = clean.substring(0, 110) + ext;
  }
  return clean;
}

/**
 * Server-side check verifying file magic numbers (signatures)
 * against stated or detected MIME type.
 */
export function verifyMagicBytes(buffer: Buffer, declaredMime: string): boolean {
  if (buffer.length < 4) return false;

  const mime = declaredMime.toLowerCase();

  // PNG: 89 50 4E 47
  if (mime === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // JPEG: FF D8 FF
  if (mime === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (mime === 'image/gif') {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }

  // WEBP: RIFF....WEBP (52 49 46 46 ... 57 45 42 50)
  if (mime === 'image/webp') {
    if (buffer.length < 12) return false;
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  // AVIF: ftypavif or ftypavis or ftypmif1
  if (mime === 'image/avif') {
    if (buffer.length < 12) return false;
    const ftyp = buffer.toString('ascii', 4, 8);
    return ftyp === 'ftyp';
  }

  // SVG: <?xml or <svg
  if (mime === 'image/svg+xml') {
    const head = buffer.toString('utf8', 0, Math.min(buffer.length, 512)).trim().toLowerCase();
    return head.includes('<svg') || head.startsWith('<?xml');
  }

  // MP4 / Quicktime (.mov): ....ftyp
  if (mime === 'video/mp4' || mime === 'video/quicktime') {
    if (buffer.length < 8) return false;
    const ftyp = buffer.toString('ascii', 4, 8);
    return ftyp === 'ftyp' || buffer.toString('ascii', 0, 4) === 'moov';
  }

  // WEBM / MKV: EBML header 1A 45 DF A3
  if (mime === 'video/webm' || mime === 'video/x-matroska') {
    return buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;
  }

  return true;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
  ext?: string;
}

export function validateUploadedFile(
  name: string,
  mimeType: string,
  size: number,
  bufferHeader?: Buffer
): ValidationResult {
  const allowedMimes = getAllowedMimeTypes();
  const normalizedMime = mimeType.toLowerCase();

  // 1. Check size limit
  const maxBytes = getMaxFileSizeBytes();
  if (size > maxBytes) {
    return {
      valid: false,
      error: `File is too large. Maximum allowed size is ${getMaxFileSizeMb()} MB.`,
    };
  }

  if (size <= 0) {
    return {
      valid: false,
      error: 'File is empty.',
    };
  }

  // 2. Check MIME type
  if (!allowedMimes.includes(normalizedMime)) {
    return {
      valid: false,
      error: `Unsupported file type (${mimeType}). Only images and videos are supported.`,
    };
  }

  // 3. Sanitize filename
  const cleanName = sanitizeFilename(name);
  const ext = path.extname(cleanName).toLowerCase();

  // 4. Validate extension matches MIME type
  const allowedExts = MIME_TO_EXTENSIONS[normalizedMime];
  if (allowedExts && !allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `File extension (${ext}) does not match declared MIME type (${mimeType}).`,
    };
  }

  // 5. Verify magic bytes if provided
  if (bufferHeader && !verifyMagicBytes(bufferHeader, normalizedMime)) {
    return {
      valid: false,
      error: 'File content does not match the declared MIME type header signature.',
    };
  }

  return {
    valid: true,
    sanitizedName: cleanName,
    ext,
  };
}
