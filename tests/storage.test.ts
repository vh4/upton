import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveLocalFile,
  deleteLocalFile,
  getPhysicalFileStat,
  assertSafePath,
  generateStoredFilename,
} from '../src/lib/storage/local';

test('Storage — Stored Filename Generation', () => {
  const name1 = generateStoredFilename('.png');
  const name2 = generateStoredFilename('.png');
  assert.notEqual(name1, name2);
  assert.ok(name1.endsWith('.png'));
  assert.ok(name1.includes('_'));
});

test('Storage — Save, Stat, and Delete Flow', async () => {
  const testBuffer = Buffer.from('Upton local storage integration test data');
  const saved = await saveLocalFile(testBuffer, '.png');

  assert.ok(saved.storedName);
  assert.ok(saved.relativePath);
  assert.ok(saved.absolutePath);
  assert.equal(saved.fileSize, testBuffer.length);

  // Check stat
  const stat = await getPhysicalFileStat(saved.relativePath);
  assert.ok(stat);
  assert.equal(stat?.exists, true);
  assert.equal(stat?.size, testBuffer.length);

  // Delete
  const deleted = await deleteLocalFile(saved.relativePath);
  assert.equal(deleted, true);

  // Verify deleted
  const statAfter = await getPhysicalFileStat(saved.relativePath);
  assert.equal(statAfter, null);
});

test('Security — assertSafePath Traversal Rejection', () => {
  // Should throw when path points outside upload directory
  assert.throws(
    () => {
      assertSafePath('../../../../../etc/passwd');
    },
    { message: /Path traversal attempt detected/ }
  );
});
