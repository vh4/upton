import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseStoragePath,
  isSupabaseStorageEnabled,
  saveFile,
  getFileStat,
  deleteFile,
  getStorageBucketName,
} from '../src/lib/storage';

test('Hybrid Storage — Path Parser Resolution', () => {
  const bucket = getStorageBucketName();

  // Standard relative local path
  const localParsed = parseStoragePath('2026/10/photo.png');
  assert.equal(localParsed.isSupabase, false);
  assert.equal(localParsed.bucket, bucket);
  assert.equal(localParsed.key, '2026/10/photo.png');

  // Supabase URL scheme with bucket
  const supabaseParsed = parseStoragePath('supabase://custom-bucket/2026/10/video.mp4');
  assert.equal(supabaseParsed.isSupabase, true);
  assert.equal(supabaseParsed.bucket, 'custom-bucket');
  assert.equal(supabaseParsed.key, '2026/10/video.mp4');

  // Supabase URL scheme without custom bucket
  const supabaseParsed2 = parseStoragePath('supabase:2026/10/video.mp4');
  assert.equal(supabaseParsed2.isSupabase, true);
  assert.equal(supabaseParsed2.key, '2026/10/video.mp4');
});

test('Hybrid Storage — Environment Driver Selection', () => {
  // On local machine without VERCEL or STORAGE_DRIVER set, should default to local
  const prevVercel = process.env.VERCEL;
  const prevDriver = process.env.STORAGE_DRIVER;

  delete process.env.VERCEL;
  delete process.env.STORAGE_DRIVER;
  assert.equal(isSupabaseStorageEnabled(), false, 'Should default to local storage on laptop');

  // When STORAGE_DRIVER=supabase
  process.env.STORAGE_DRIVER = 'supabase';
  assert.equal(isSupabaseStorageEnabled(), true, 'Should use Supabase Storage when explicitly set');

  // When STORAGE_DRIVER=local
  process.env.STORAGE_DRIVER = 'local';
  assert.equal(isSupabaseStorageEnabled(), false, 'Should use local storage when explicitly set');

  // Restore
  if (prevVercel !== undefined) process.env.VERCEL = prevVercel;
  else delete process.env.VERCEL;
  if (prevDriver !== undefined) process.env.STORAGE_DRIVER = prevDriver;
  else delete process.env.STORAGE_DRIVER;
});

test('Hybrid Storage — Local Save, Stat, and Delete Integration', async () => {
  const testBuffer = Buffer.from('Testing hybrid storage local driver fallback');
  const saved = await saveFile(testBuffer, '.txt', 'text/plain');

  assert.ok(saved.storedName);
  assert.ok(saved.relativePath);
  assert.equal(saved.fileSize, testBuffer.length);

  // Check stat via unified getFileStat
  const stat = await getFileStat(saved.relativePath);
  assert.ok(stat);
  assert.equal(stat?.exists, true);

  // Delete via unified deleteFile
  const deleted = await deleteFile(saved.relativePath);
  assert.equal(deleted, true);

  // Verify file is gone
  const statAfter = await getFileStat(saved.relativePath);
  assert.equal(statAfter, null);
});
