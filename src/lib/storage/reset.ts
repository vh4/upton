import { getAllFiles, deleteAllFileRecords, getStorageMetrics, StorageMetrics } from '@/lib/db';
import { deleteSupabaseFilesBatch, emptySupabaseBucket, isSupabaseConfigured } from './supabase';
import { resetLocalStorageDir } from './local';
import { getMaxStorageBytes } from './limits';

export interface StorageResetResult {
  success: boolean;
  message: string;
  deletedFilesCount: number;
  freedBytes: number;
  timestamp: string;
}

/**
 * Executes a full storage reset:
 * 1. Collects all file paths from DB.
 * 2. Deletes all objects from Supabase Storage bucket and/or local filesystem.
 * 3. Deletes all records from 'files' database table.
 */
export async function executeStorageReset(): Promise<StorageResetResult> {
  console.log('[reset] Executing full storage reset...');
  const files = await getAllFiles();
  const totalFiles = files.length;
  const freedBytes = files.reduce((acc, f) => acc + (Number(f.file_size) || 0), 0);

  // 1. Delete physical files from local storage
  await resetLocalStorageDir();

  // 2. Delete files from Supabase Storage
  if (isSupabaseConfigured()) {
    const paths = files.map((f) => f.file_path);
    if (paths.length > 0) {
      await deleteSupabaseFilesBatch(paths);
    }
    // Also sweep bucket to remove any orphaned objects
    await emptySupabaseBucket();
  }

  // 3. Clear database records
  await deleteAllFileRecords();

  console.log(`[reset] Storage reset complete. Removed ${totalFiles} file(s) and freed ${freedBytes} bytes.`);

  return {
    success: true,
    message: `Storage berhasil di-reset sepenuhnya. ${totalFiles} file dihapus dan ${Math.round(freedBytes / (1024 * 1024))} MB ruang dikosongkan.`,
    deletedFilesCount: totalFiles,
    freedBytes,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Checks if current storage usage + incoming file size exceeds the 1 GB cap.
 * If exceeded, automatically executes full storage reset as configured.
 */
export async function autoResetStorageIfExceeded(incomingBytes: number = 0): Promise<{ resetTriggered: boolean; metrics: StorageMetrics }> {
  const maxBytes = getMaxStorageBytes();
  const metrics = await getStorageMetrics(maxBytes);

  if (metrics.totalBytes + incomingBytes >= maxBytes) {
    console.warn(`[storage:autoreset] Storage limit reached (${metrics.totalBytes} + ${incomingBytes} >= ${maxBytes} bytes). Triggering auto-reset...`);
    await executeStorageReset();
    const updatedMetrics = await getStorageMetrics(maxBytes);
    return {
      resetTriggered: true,
      metrics: updatedMetrics,
    };
  }

  return {
    resetTriggered: false,
    metrics,
  };
}
