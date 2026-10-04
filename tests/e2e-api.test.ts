import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST as handleUpload } from '../src/app/api/upload/route';
import { GET as handleGetFile, DELETE as handleDeleteFile } from '../src/app/api/files/[id]/route';
import { GET as handleDownload } from '../src/app/api/files/[id]/download/route';
import { GET as handleRaw } from '../src/app/api/files/[id]/raw/route';
import { POST as handleBatch } from '../src/app/api/files/batch/route';
import { closeDbPool } from '../src/lib/db';
import { deleteLocalFile } from '../src/lib/storage/local';

test('E2E — Full Upload, Download, Expiration, and Delete Lifecycle', async () => {
  // 1. Test image upload (1 hour expiration)
  const pngBytes = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  ]);
  const imageFile = new File([pngBytes], 'sample.png', { type: 'image/png' });

  const formData1 = new FormData();
  formData1.append('expirationPreset', '1h');
  formData1.append('files', imageFile);

  const req1 = new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData1,
  });

  const res1 = await handleUpload(req1);
  assert.equal(res1.status, 201);
  const data1 = await res1.json();
  assert.equal(data1.success, true);
  assert.equal(data1.files.length, 1);

  const uploadedImage = data1.files[0].file;
  const imageDeleteToken = data1.files[0].delete_token;
  assert.equal(uploadedImage.original_name, 'sample.png');
  assert.equal(uploadedImage.mime_type, 'image/png');
  assert.ok(uploadedImage.expires_at, '1h file must have expires_at timestamp');

  // Verify expiration is ~1 hour in future
  const expireTime = new Date(uploadedImage.expires_at).getTime();
  const diffHours = (expireTime - Date.now()) / (1000 * 3600);
  assert.ok(diffHours >= 0.9 && diffHours <= 1.1);

  // 2. Test video upload (Permanent)
  const mp4Bytes = Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
  ]);
  const videoFile = new File([mp4Bytes], 'demo.mp4', { type: 'video/mp4' });

  const formData2 = new FormData();
  formData2.append('expirationPreset', 'permanent');
  formData2.append('files', videoFile);

  const req2 = new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData2,
  });

  const res2 = await handleUpload(req2);
  assert.equal(res2.status, 201);
  const data2 = await res2.json();
  const uploadedVideo = data2.files[0].file;
  const videoDeleteToken = data2.files[0].delete_token;
  assert.equal(uploadedVideo.original_name, 'demo.mp4');
  assert.equal(uploadedVideo.is_video, true);
  assert.equal(uploadedVideo.expires_at, null, 'Permanent file must have expires_at = null');

  // 3. Test multiple files upload with custom expiration (5 days)
  const fileA = new File([pngBytes], 'gallery1.png', { type: 'image/png' });
  const fileB = new File([pngBytes], 'gallery2.png', { type: 'image/png' });

  const formData3 = new FormData();
  formData3.append('expirationPreset', 'custom');
  formData3.append('customValue', '5');
  formData3.append('customUnit', 'days');
  formData3.append('files', fileA);
  formData3.append('files', fileB);

  const req3 = new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData3,
  });

  const res3 = await handleUpload(req3);
  const data3 = await res3.json();
  assert.equal(data3.files.length, 2);
  const customExpireDiffDays =
    (new Date(data3.files[0].file.expires_at).getTime() - Date.now()) / (1000 * 3600 * 24);
  assert.ok(customExpireDiffDays >= 4.9 && customExpireDiffDays <= 5.1);

  // 4. Test GET /api/files/[id]
  const reqGet = new NextRequest(`http://localhost:3000/api/files/${uploadedImage.id}`);
  const resGet = await handleGetFile(reqGet, {
    params: Promise.resolve({ id: uploadedImage.id }),
  });
  assert.equal(resGet.status, 200);
  const getJson = await resGet.json();
  assert.equal(getJson.file.original_name, 'sample.png');

  // 5. Test Raw streaming endpoint /api/files/[id]/raw
  const reqRaw = new NextRequest(`http://localhost:3000/api/files/${uploadedImage.id}/raw`);
  const resRaw = await handleRaw(reqRaw, {
    params: Promise.resolve({ id: uploadedImage.id }),
  });
  assert.equal(resRaw.status, 200);
  assert.equal(resRaw.headers.get('Content-Type'), 'image/png');

  // 6. Test Download endpoint and download counter increment
  const reqDownload = new NextRequest(
    `http://localhost:3000/api/files/${uploadedImage.id}/download`
  );
  const resDownload = await handleDownload(reqDownload, {
    params: Promise.resolve({ id: uploadedImage.id }),
  });
  assert.equal(resDownload.status, 200);
  const disposition = resDownload.headers.get('Content-Disposition') || '';
  assert.ok(disposition.includes('sample.png'), 'Download header must preserve original filename');

  // Wait a moment for async counter increment
  await new Promise((resolve) => setTimeout(resolve, 50));
  const resCheckDownload = await handleGetFile(reqGet, {
    params: Promise.resolve({ id: uploadedImage.id }),
  });
  const checkJson = await resCheckDownload.json();
  assert.ok(checkJson.file.download_count >= 1, 'Download count should have incremented');

  // 7. Test Batch status endpoint
  const reqBatch = new NextRequest('http://localhost:3000/api/files/batch', {
    method: 'POST',
    body: JSON.stringify({ ids: [uploadedImage.id, uploadedVideo.id] }),
  });
  const resBatch = await handleBatch(reqBatch);
  const batchData = await resBatch.json();
  assert.equal(batchData.files.length, 2);

  // 8. Test Invalid Delete Token (Forbidden 403)
  const reqBadDelete = new NextRequest(
    `http://localhost:3000/api/files/${uploadedImage.id}?token=wrong_token`,
    { method: 'DELETE' }
  );
  const resBadDelete = await handleDeleteFile(reqBadDelete, {
    params: Promise.resolve({ id: uploadedImage.id }),
  });
  assert.equal(resBadDelete.status, 403);

  // 9. Test Valid Delete Token (Success 200)
  const reqGoodDelete = new NextRequest(
    `http://localhost:3000/api/files/${uploadedImage.id}?token=${imageDeleteToken}`,
    { method: 'DELETE' }
  );
  const resGoodDelete = await handleDeleteFile(reqGoodDelete, {
    params: Promise.resolve({ id: uploadedImage.id }),
  });
  assert.equal(resGoodDelete.status, 200);

  // Verify file is gone
  const resVerifyGone = await handleGetFile(reqGet, {
    params: Promise.resolve({ id: uploadedImage.id }),
  });
  assert.equal(resVerifyGone.status, 404);

  // Cleanup other test files
  await handleDeleteFile(
    new NextRequest(`http://localhost:3000/api/files/${uploadedVideo.id}?token=${videoDeleteToken}`, {
      method: 'DELETE',
    }),
    { params: Promise.resolve({ id: uploadedVideo.id }) }
  );

  for (const item of data3.files) {
    await handleDeleteFile(
      new NextRequest(
        `http://localhost:3000/api/files/${item.file.id}?token=${item.delete_token}`,
        { method: 'DELETE' }
      ),
      { params: Promise.resolve({ id: item.file.id }) }
    );
  }

  await closeDbPool();
});
