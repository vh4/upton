import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAdminCredentials,
  createAdminToken,
  verifyAdminToken,
} from '../src/lib/admin/auth';
import { getMaxStorageBytes, formatStoragePercent } from '../src/lib/storage/limits';
import { saveFile } from '../src/lib/storage';
import { insertFileRecord, getAllFiles, getStorageMetrics } from '../src/lib/db';
import { executeStorageReset } from '../src/lib/storage/reset';

test('Admin Auth — Credential & Session Token Verification', () => {
  const creds = getAdminCredentials();
  assert.equal(creds.username, 'tony');
  assert.equal(creds.password, 'wirsumatmo123');

  const token = createAdminToken('tony');
  assert.ok(token);

  const verification = verifyAdminToken(token);
  assert.equal(verification.valid, true);
  assert.equal(verification.username, 'tony');

  const invalidVerification = verifyAdminToken('tampered_token_xyz');
  assert.equal(invalidVerification.valid, false);
});

test('Storage Limits — 1 GB Capacity Calculation', () => {
  const maxBytes = getMaxStorageBytes();
  // 1 GB = 1024 * 1024 * 1024 = 1,073,741,824
  assert.equal(maxBytes, 1073741824);

  const pct = formatStoragePercent(536870912, maxBytes); // 500 MB / 1 GB
  assert.equal(pct, 50);
});

test('Storage Reset — Full Purge Clears Files and Records', async () => {
  // Create dummy test file
  const testBuffer = Buffer.from('test reset content');
  const saved = await saveFile(testBuffer, 'txt', 'text/plain');

  await insertFileRecord({
    id: '11111111-2222-3333-4444-555555555555',
    original_name: 'reset-test.txt',
    stored_name: saved.storedName,
    mime_type: 'text/plain',
    file_size: testBuffer.length,
    file_path: saved.relativePath,
    public_url: 'http://localhost:3000/f/11111111-2222-3333-4444-555555555555',
    expires_at: null, // Permanent file
    delete_token: 'test_token',
    width: null,
    height: null,
    duration: null,
  });

  const filesBefore = await getAllFiles();
  assert.ok(filesBefore.length >= 1);

  // Execute full reset
  const resetRes = await executeStorageReset();
  assert.equal(resetRes.success, true);
  assert.ok(resetRes.deletedFilesCount >= 1);

  const filesAfter = await getAllFiles();
  assert.equal(filesAfter.length, 0);

  const metricsAfter = await getStorageMetrics();
  assert.equal(metricsAfter.totalFiles, 0);
  assert.equal(metricsAfter.totalBytes, 0);
});
