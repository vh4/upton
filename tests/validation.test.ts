import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUploadedFile,
  sanitizeFilename,
  verifyMagicBytes,
  getMaxFileSizeBytes,
} from '../src/lib/validation/mime';

test('File Validation — Allowed Images and Videos', () => {
  // Valid PNG with matching header
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const res1 = validateUploadedFile('photo.png', 'image/png', 1024, pngHeader);
  assert.equal(res1.valid, true);
  assert.equal(res1.sanitizedName, 'photo.png');
  assert.equal(res1.ext, '.png');

  // Valid MP4 video
  const mp4Header = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]); // ....ftyp
  const res2 = validateUploadedFile('clip.mp4', 'video/mp4', 5000000, mp4Header);
  assert.equal(res2.valid, true);
  assert.equal(res2.ext, '.mp4');
});

test('File Validation — Rejects Unsupported Types and Executables', () => {
  const resPhp = validateUploadedFile('malicious.php', 'application/x-php', 500);
  assert.equal(resPhp.valid, false);
  assert.match(resPhp.error || '', /Unsupported file type/);

  const resExe = validateUploadedFile('virus.exe', 'application/x-msdownload', 500);
  assert.equal(resExe.valid, false);
});

test('File Validation — Rejects Oversized Files', () => {
  const maxBytes = getMaxFileSizeBytes();
  const res = validateUploadedFile('giant.mp4', 'video/mp4', maxBytes + 1024);
  assert.equal(res.valid, false);
  assert.match(res.error || '', /File is too large/);
});

test('Security — Filename Sanitization & Path Traversal Guard', () => {
  // Directory traversal injection
  const malicious1 = '../../../../etc/passwd.png';
  const clean1 = sanitizeFilename(malicious1);
  assert.equal(clean1.includes('..'), false);
  assert.equal(clean1.includes('/'), false);
  assert.equal(clean1.includes('\\'), false);
  assert.equal(clean1, 'passwd.png');

  // Null byte injection
  const malicious2 = 'shell.php\x00.png';
  const clean2 = sanitizeFilename(malicious2);
  assert.equal(clean2.includes('\x00'), false);

  // Illegal Windows characters
  const malicious3 = 'test:*?"<>|.jpg';
  const clean3 = sanitizeFilename(malicious3);
  assert.equal(clean3.includes(':'), false);
  assert.equal(clean3.includes('*'), false);
  assert.equal(clean3.includes('?'), false);
});

test('Magic Bytes Verification', () => {
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.equal(verifyMagicBytes(validJpeg, 'image/jpeg'), true);

  const fakeJpeg = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  assert.equal(verifyMagicBytes(fakeJpeg, 'image/jpeg'), false);

  const validGif = Buffer.from('GIF89a...');
  assert.equal(verifyMagicBytes(validGif, 'image/gif'), true);

  const validWebm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
  assert.equal(verifyMagicBytes(validWebm, 'video/webm'), true);
});
