import fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';

export function getUploadBaseDir(): string {
  if (process.env.UPLOAD_DIR) {
    return path.isAbsolute(process.env.UPLOAD_DIR)
      ? process.env.UPLOAD_DIR
      : path.resolve(process.cwd(), process.env.UPLOAD_DIR);
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/file';
  }
  return path.resolve(process.cwd(), './file');
}

/**
 * Creates date-partitioned storage directory e.g., /file/2026/10
 */
export async function ensureUploadDir(): Promise<string> {
  const base = getUploadBaseDir();
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const targetDir = path.join(base, year, month);

  await fs.mkdir(targetDir, { recursive: true });
  return targetDir;
}

/**
 * Generates an unguessable unique stored filename.
 */
export function generateStoredFilename(originalExtension: string): string {
  const randomHex = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36);
  const cleanExt = originalExtension.startsWith('.') ? originalExtension : `.${originalExtension}`;
  return `${timestamp}_${randomHex}${cleanExt.toLowerCase()}`;
}

/**
 * Validates that an absolute or relative path strictly resides within the upload base directory.
 * Prevents any directory traversal attack.
 */
export function assertSafePath(targetPath: string): string {
  const baseDir = getUploadBaseDir();
  const resolved = path.resolve(baseDir, targetPath);

  if (!resolved.startsWith(baseDir)) {
    throw new Error('Security Error: Path traversal attempt detected.');
  }

  return resolved;
}

export interface SaveFileResult {
  storedName: string;
  relativePath: string;
  absolutePath: string;
  fileSize: number;
}

/**
 * Writes uploaded buffer to local storage in date-partitioned structure.
 */
export async function saveLocalFile(
  buffer: Buffer,
  extension: string
): Promise<SaveFileResult> {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  const baseDir = getUploadBaseDir();
  const partitionDir = path.join(baseDir, year, month);
  await fs.mkdir(partitionDir, { recursive: true });

  const storedName = generateStoredFilename(extension);
  const relativePath = path.join(year, month, storedName);
  const absolutePath = path.join(partitionDir, storedName);

  // Security assertion
  assertSafePath(absolutePath);

  await fs.writeFile(absolutePath, buffer);

  return {
    storedName,
    relativePath,
    absolutePath,
    fileSize: buffer.length,
  };
}

/**
 * Safely removes a file from the filesystem.
 * Gracefully ignores missing files without throwing.
 */
export async function deleteLocalFile(relativePathOrAbsolute: string): Promise<boolean> {
  try {
    const fullPath = path.isAbsolute(relativePathOrAbsolute)
      ? assertSafePath(relativePathOrAbsolute)
      : assertSafePath(path.join(getUploadBaseDir(), relativePathOrAbsolute));

    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`[storage] Could not delete file: ${relativePathOrAbsolute}`, err);
    return false;
  }
}

/**
 * Checks if the physical file exists and returns stat.
 */
export async function getPhysicalFileStat(relativePathOrAbsolute: string) {
  try {
    const fullPath = path.isAbsolute(relativePathOrAbsolute)
      ? assertSafePath(relativePathOrAbsolute)
      : assertSafePath(path.join(getUploadBaseDir(), relativePathOrAbsolute));

    if (!existsSync(fullPath)) return null;
    const stat = await fs.stat(fullPath);
    return {
      exists: true,
      size: stat.size,
      fullPath,
    };
  } catch {
    return null;
  }
}

/**
 * Returns a readable stream for a physical file.
 */
export function createPhysicalFileStream(
  relativePathOrAbsolute: string,
  options?: { start?: number; end?: number }
) {
  const fullPath = path.isAbsolute(relativePathOrAbsolute)
    ? assertSafePath(relativePathOrAbsolute)
    : assertSafePath(path.join(getUploadBaseDir(), relativePathOrAbsolute));

  if (!existsSync(fullPath)) {
    throw new Error('File not found on disk');
  }

  return createReadStream(fullPath, options);
}
