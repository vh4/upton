'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, FileVideo, ShieldAlert, Sparkles, ArrowUp } from 'lucide-react';
import { ExpirationPicker } from './ExpirationPicker';
import { FileList, QueuedFile } from './FileList';
import { UploadSuccessModal } from './UploadSuccessModal';
import { ExpirationOption, UploadedFileResponse } from '@/types/file';
import { useToast } from '@/components/ui/Toast';
import { validateUploadedFile, getMaxFileSizeMb } from '@/lib/validation/mime';
import { addLocalUploadHistoryItem } from '@/lib/storage/history';

export function Dropzone() {
  const { error, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadedFileResponse[] | null>(null);

  const [expiration, setExpiration] = useState<ExpirationOption>({
    preset: '24h',
  });

  const maxMb = getMaxFileSizeMb();

  const handleFilesAdded = useCallback(
    (newFiles: FileList | File[]) => {
      const added: QueuedFile[] = [];

      Array.from(newFiles).forEach((file) => {
        // Quick client-side preliminary validation
        const val = validateUploadedFile(file.name, file.type, file.size);
        if (!val.valid) {
          error(`${file.name}: ${val.error}`);
          return;
        }

        // Avoid exact duplicates in current queue
        const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        added.push({
          id,
          file,
          progress: 0,
          status: 'idle',
        });
      });

      if (added.length > 0) {
        setQueuedFiles((prev) => [...prev, ...added]);
      }
    },
    [error]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
      // Reset input value so same files can be re-selected if removed
      e.target.value = '';
    }
  };

  const handleRemoveQueuedFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadWithXhr = (
    url: string,
    file: File,
    onProgress: (percent: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve();
        } else {
          reject(
            new Error(
              `Storage upload failed (${xhr.status}): ${xhr.statusText || 'Error uploading file'}`
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network connection error while uploading to storage.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out. Please check your internet connection.'));
      };

      xhr.send(file);
    });
  };

  const handleUpload = async () => {
    if (queuedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setOverallProgress(5);

    try {
      const results: UploadedFileResponse[] = [];

      // Check if direct upload is supported by querying /api/upload/direct-init for the first file
      const first = queuedFiles[0];
      const testInitRes = await fetch('/api/upload/direct-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: first.file.name,
          fileType: first.file.type || 'application/octet-stream',
          fileSize: first.file.size,
          expirationPreset: expiration.preset,
          customValue: expiration.customValue,
          customUnit: expiration.customUnit,
        }),
      });

      const testInitText = await testInitRes.text();
      let testInitData: any = null;
      try {
        testInitData = JSON.parse(testInitText);
      } catch {
        testInitData = null;
      }

      const isSupabaseDirect =
        testInitRes.ok && testInitData && testInitData.mode === 'supabase';

      if (isSupabaseDirect) {
        // DIRECT UPLOAD TO SUPABASE STORAGE (Bypasses Vercel 4.5MB serverless limit)
        for (let i = 0; i < queuedFiles.length; i++) {
          const item = queuedFiles[i];

          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: 'uploading', progress: 5 } : f
            )
          );

          // 1. Get signed upload URL
          let initData = i === 0 ? testInitData : null;
          if (!initData || !initData.uploadUrl) {
            const initRes = await fetch('/api/upload/direct-init', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: item.file.name,
                fileType: item.file.type || 'application/octet-stream',
                fileSize: item.file.size,
                expirationPreset: expiration.preset,
                customValue: expiration.customValue,
                customUnit: expiration.customUnit,
              }),
            });

            const initText = await initRes.text();
            try {
              initData = JSON.parse(initText);
            } catch {
              throw new Error(
                `Gagal inisialisasi upload (${initRes.status}): ${initText.slice(0, 100)}`
              );
            }

            if (!initRes.ok || !initData.uploadUrl) {
              throw new Error(initData.error || 'Gagal menyiapkan URL upload.');
            }
          }

          // 2. Upload binary directly to Supabase Storage with progress
          await uploadWithXhr(initData.uploadUrl, item.file, (percent) => {
            setQueuedFiles((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, progress: percent } : f
              )
            );
            const overall = Math.round(
              ((i + percent / 100) / queuedFiles.length) * 90
            );
            setOverallProgress(overall);
          });

          // 3. Register file metadata in database
          const compRes = await fetch('/api/upload/direct-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId: initData.fileId,
              originalName: initData.sanitizedName || item.file.name,
              storedName: initData.storedName,
              mimeType: item.file.type || initData.mimeType,
              fileSize: item.file.size,
              filePath: initData.filePath,
              expiresAt: initData.expiresAt,
              deleteToken: initData.deleteToken,
            }),
          });

          const compText = await compRes.text();
          let compData: any;
          try {
            compData = JSON.parse(compText);
          } catch {
            throw new Error(
              `Gagal menyimpan metadata file (${compRes.status}): ${compText.slice(0, 100)}`
            );
          }

          if (!compRes.ok || !compData.success) {
            throw new Error(compData.error || 'Gagal menyelesaikan upload.');
          }

          results.push(compData);

          setQueuedFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: 'completed', progress: 100 } : f
            )
          );
        }
      } else {
        // LOCAL MULTIPART UPLOAD (Laptop localhost ./file)
        const formData = new FormData();
        formData.append('expirationPreset', expiration.preset);
        if (expiration.customValue) {
          formData.append('customValue', expiration.customValue.toString());
        }
        if (expiration.customUnit) {
          formData.append('customUnit', expiration.customUnit);
        }

        queuedFiles.forEach((item) => {
          formData.append('files', item.file);
        });

        setQueuedFiles((prev) =>
          prev.map((f) => ({ ...f, status: 'uploading', progress: 35 }))
        );
        setOverallProgress(40);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        setQueuedFiles((prev) => prev.map((f) => ({ ...f, progress: 90 })));
        setOverallProgress(90);

        const resText = await res.text();
        let data: any;
        try {
          data = JSON.parse(resText);
        } catch {
          if (res.status === 413 || resText.includes('Request Entity Too Large')) {
            throw new Error(
              'File terlalu besar untuk serverless (Request Entity Too Large). Maksimum upload terlampaui.'
            );
          }
          throw new Error(`Upload error (${res.status}): ${resText.slice(0, 120)}`);
        }

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Upload failed.');
        }

        results.push(...data.files);

        setQueuedFiles((prev) =>
          prev.map((f) => ({ ...f, status: 'completed', progress: 100 }))
        );
      }

      setOverallProgress(100);

      // Save to local upload history for Dashboard tracking
      results.forEach((item) => {
        addLocalUploadHistoryItem({
          id: item.file.id,
          original_name: item.file.original_name,
          mime_type: item.file.mime_type,
          file_size: item.file.file_size,
          public_url: item.file.public_url,
          delete_token: item.delete_token,
          created_at: item.file.created_at,
          expires_at: item.file.expires_at,
        });
      });

      success(`Successfully uploaded ${results.length} file(s)!`);
      setUploadResults(results);
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err?.message || 'Upload failed. Please try again.';
      error(msg);

      setQueuedFiles((prev) =>
        prev.map((f) =>
          f.status !== 'completed'
            ? { ...f, status: 'error', errorMessage: msg }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setQueuedFiles([]);
    setUploadResults(null);
    setOverallProgress(0);
  };

  if (uploadResults) {
    return <UploadSuccessModal results={uploadResults} onReset={handleReset} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl sm:rounded-3xl p-4 sm:p-10 text-center transition-all duration-300 border-2 border-dashed ${
          isDragOver
            ? 'border-zinc-900 bg-zinc-100 scale-[1.01] shadow-2xl dark:border-zinc-200 dark:bg-zinc-900/90'
            : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50/60 dark:border-zinc-800/90 dark:bg-zinc-950/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40'
        } glass-panel`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Upload Icon with subtle pulse */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform dark:bg-zinc-900 dark:border-zinc-800 shadow-inner">
          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-700 dark:text-zinc-300" />
        </div>

        <h3 className="text-base sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Drop your files here
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-1">
          or <span className="text-zinc-900 font-semibold underline underline-offset-4 dark:text-zinc-100">click to browse</span> from your device
        </p>

        {/* Format Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-900/90 dark:text-zinc-300 dark:border-zinc-800">
            <FileImage className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Images (JPG, PNG, GIF, WEBP, AVIF, SVG)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-900/90 dark:text-zinc-300 dark:border-zinc-800">
            <FileVideo className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            Videos (MP4, WEBM, MOV, MKV)
          </span>
        </div>

        <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-2.5 sm:mt-3 px-1 leading-snug">
          Maksimum file: {maxMb} MB &middot; Kapasitas storage: 1 GB (Auto-reset saat penuh)
        </p>
      </div>

      {/* Selected Files Queue */}
      <FileList
        files={queuedFiles}
        onRemove={handleRemoveQueuedFile}
        isUploading={isUploading}
      />

      {/* Expiration Configuration */}
      <div className="rounded-2xl glass-panel p-3.5 sm:p-5 border border-zinc-200 dark:border-zinc-800/80">
        <ExpirationPicker value={expiration} onChange={setExpiration} />
      </div>

      {/* Upload Action Button */}
      {queuedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full min-h-[46px] py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-xl flex items-center justify-center gap-2 touch-manipulation ${
            isUploading
              ? 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed'
              : 'bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 active:scale-[0.99]'
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
              <span>Uploading {queuedFiles.length} file(s)... {overallProgress}%</span>
            </>
          ) : (
            <>
              <ArrowUp className="w-4 h-4" />
              <span>Upload {queuedFiles.length} File{queuedFiles.length > 1 ? 's' : ''} Now</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
