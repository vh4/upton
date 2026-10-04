import {
  saveLocalFile,
  deleteLocalFile,
  getPhysicalFileStat,
  SaveFileResult,
  getUploadBaseDir,
  assertSafePath,
  generateStoredFilename,
} from './local';
import {
  saveSupabaseFile,
  deleteSupabaseFile,
  getSupabaseFileStat,
  getSupabaseFileUrl,
  parseStoragePath,
  isSupabaseStorageEnabled,
  isSupabaseConfigured,
  getStorageBucketName,
  ensureSupabaseBucket,
} from './supabase';

export * from './local';
export * from './supabase';
export * from './limits';
export * from './reset';

/**
 * Saves uploaded file using hybrid driver:
 * - If in Supabase Storage mode (Vercel/Production or STORAGE_DRIVER=supabase):
 *   Uploads directly to Supabase Storage bucket ('upton-files').
 * - Otherwise (Local Development laptop):
 *   Saves to local filesystem folder (./file).
 */
export async function saveFile(
  buffer: Buffer,
  extension: string,
  mimeType: string
): Promise<SaveFileResult> {
  if (isSupabaseStorageEnabled()) {
    console.log('[storage] Saving file to Supabase Storage...');
    return await saveSupabaseFile(buffer, extension, mimeType);
  }

  console.log('[storage] Saving file to local storage (./file)...');
  return await saveLocalFile(buffer, extension);
}

/**
 * Deletes file from the appropriate storage (Supabase or local disk).
 * Gracefully handles missing files without throwing.
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  const parsed = parseStoragePath(filePath);

  if (parsed.isSupabase) {
    return await deleteSupabaseFile(filePath);
  }

  // Try local disk first
  let deleted = await deleteLocalFile(filePath);

  // If not on local disk and Supabase is configured, attempt Supabase removal
  if (!deleted && isSupabaseConfigured()) {
    deleted = await deleteSupabaseFile(filePath);
  }

  return deleted;
}

/**
 * Checks file existence and returns metadata stat.
 * Works seamlessly across both Supabase Storage and local disk.
 */
export async function getFileStat(
  filePath: string
): Promise<{ exists: boolean; size?: number; fullPath?: string } | null> {
  const parsed = parseStoragePath(filePath);

  if (parsed.isSupabase) {
    return await getSupabaseFileStat(filePath);
  }

  // If standard relative path, check local disk first
  const localStat = await getPhysicalFileStat(filePath);
  if (localStat) {
    return localStat;
  }

  // Fallback: If not found on local disk, check if it was stored in Supabase
  if (isSupabaseConfigured()) {
    const supabaseStat = await getSupabaseFileStat(filePath);
    if (supabaseStat) {
      return supabaseStat;
    }
  }

  return null;
}

/**
 * Obtains URL for preview or direct download.
 */
export async function getFileUrl(
  filePath: string,
  options?: { download?: string }
): Promise<string | null> {
  const parsed = parseStoragePath(filePath);

  if (parsed.isSupabase || isSupabaseStorageEnabled()) {
    return await getSupabaseFileUrl(filePath, options);
  }

  return null;
}
