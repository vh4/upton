import { getExpiredFiles, deleteExpiredRecords } from '@/lib/db';
import { deleteLocalFile } from '@/lib/storage/local';

export interface CleanupResult {
  totalExpired: number;
  filesDeleted: number;
  recordsDeleted: number;
  errors: string[];
}

/**
 * Core cleanup service for expired files:
 * 1. Finds expired records in PostgreSQL (expires_at < NOW())
 * 2. Deletes physical file from /file
 * 3. Deletes database record
 * 4. Handles missing files gracefully
 * 5. Logs cleanup errors without crashing
 */
export async function cleanupExpiredFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    totalExpired: 0,
    filesDeleted: 0,
    recordsDeleted: 0,
    errors: [],
  };

  try {
    const expiredList = await getExpiredFiles();
    result.totalExpired = expiredList.length;

    if (expiredList.length === 0) {
      console.log('[cleanup] No expired files found.');
      return result;
    }

    console.log(`[cleanup] Found ${expiredList.length} expired file(s) to remove.`);

    const recordIdsToDelete: string[] = [];

    for (const item of expiredList) {
      try {
        // Physical removal
        const deleted = await deleteLocalFile(item.file_path);
        if (deleted) {
          result.filesDeleted++;
        }
        recordIdsToDelete.push(item.id);
      } catch (err: any) {
        const msg = `Failed to delete physical file for id ${item.id} (${item.file_path}): ${err?.message || err}`;
        console.error(`[cleanup] ${msg}`);
        result.errors.push(msg);
        // Still delete record so we don't loop on broken files
        recordIdsToDelete.push(item.id);
      }
    }

    if (recordIdsToDelete.length > 0) {
      const deletedCount = await deleteExpiredRecords(recordIdsToDelete);
      result.recordsDeleted = deletedCount;
    }

    console.log(
      `[cleanup] Cleanup completed: ${result.filesDeleted} file(s) deleted from disk, ${result.recordsDeleted} record(s) removed from DB.`
    );
  } catch (err: any) {
    const fatal = `Fatal cleanup error: ${err?.message || err}`;
    console.error(`[cleanup] ${fatal}`);
    result.errors.push(fatal);
  }

  return result;
}
