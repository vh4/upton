import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { insertFileRecord, getFileById, closeDbPool } from '../src/lib/db';
import { saveLocalFile, getPhysicalFileStat, deleteLocalFile } from '../src/lib/storage/local';
import { cleanupExpiredFiles } from '../src/lib/cleanup/service';

test('Cleanup Engine — Purges Expired Files and Retains Active Files', async () => {
  // 1. Create a permanent file
  const permBuffer = Buffer.from('Permanent Upton File');
  const permSaved = await saveLocalFile(permBuffer, '.png');
  const permRecord = await insertFileRecord({
    original_name: 'permanent.png',
    stored_name: permSaved.storedName,
    mime_type: 'image/png',
    file_size: permSaved.fileSize,
    file_path: permSaved.relativePath,
    public_url: 'http://localhost:3000/f/perm-test',
    expires_at: null, // Permanent
    delete_token: 'perm_token_123',
    width: null,
    height: null,
    duration: null,
  });

  // 2. Create an already expired file (past timestamp)
  const expiredBuffer = Buffer.from('Expired Upton File Content');
  const expSaved = await saveLocalFile(expiredBuffer, '.png');
  const pastTimestamp = new Date(Date.now() - 5000).toISOString();
  const expRecord = await insertFileRecord({
    original_name: 'expired.png',
    stored_name: expSaved.storedName,
    mime_type: 'image/png',
    file_size: expSaved.fileSize,
    file_path: expSaved.relativePath,
    public_url: 'http://localhost:3000/f/exp-test',
    expires_at: pastTimestamp,
    delete_token: 'exp_token_123',
    width: null,
    height: null,
    duration: null,
  });

  // Verify both exist on disk initially
  assert.ok(await getPhysicalFileStat(permSaved.relativePath));
  assert.ok(await getPhysicalFileStat(expSaved.relativePath));

  // 3. Run cleanup
  const cleanupRes = await cleanupExpiredFiles();
  assert.ok(cleanupRes.totalExpired >= 1);
  assert.ok(cleanupRes.filesDeleted >= 1);
  assert.ok(cleanupRes.recordsDeleted >= 1);

  // 4. Verify expired file was deleted from disk and DB
  const expStatAfter = await getPhysicalFileStat(expSaved.relativePath);
  assert.equal(expStatAfter, null, 'Expired file should be deleted from disk');

  const expRecordAfter = await getFileById(expRecord.id);
  assert.equal(expRecordAfter, null, 'Expired record should be deleted from DB');

  // 5. Verify permanent file was NOT touched
  const permStatAfter = await getPhysicalFileStat(permSaved.relativePath);
  assert.ok(permStatAfter, 'Permanent file must remain on disk');

  const permRecordAfter = await getFileById(permRecord.id);
  assert.ok(permRecordAfter, 'Permanent record must remain in DB');

  // Clean up permanent test file and close pool
  if (permRecordAfter) {
    await deleteLocalFile(permSaved.relativePath);
  }
  await closeDbPool();
});
