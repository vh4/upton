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

  const handleUpload = async () => {
    if (queuedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setOverallProgress(10);

    try {
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

      // Update file statuses to uploading
      setQueuedFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'uploading', progress: 35 }))
      );
      setOverallProgress(40);

      // Perform upload request with XMLHttpRequest to track upload progress if needed,
      // or fetch with simulated smooth progression
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setQueuedFiles((prev) =>
        prev.map((f) => ({ ...f, progress: 90 }))
      );
      setOverallProgress(90);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed.');
      }

      const results: UploadedFileResponse[] = data.files;

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

      setQueuedFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'completed', progress: 100 }))
      );
      setOverallProgress(100);

      success(`Successfully uploaded ${results.length} file(s)!`);
      setUploadResults(results);
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err?.message || 'Upload failed. Please try again.';
      error(msg);

      setQueuedFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'error', errorMessage: msg }))
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 border-2 border-dashed ${
          isDragOver
            ? 'border-zinc-200 bg-zinc-900/90 scale-[1.01] shadow-2xl light:border-zinc-800 light:bg-zinc-100'
            : 'border-zinc-800/90 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40 light:border-zinc-300 light:bg-white light:hover:border-zinc-400'
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
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform light:bg-zinc-100 light:border-zinc-300 shadow-inner">
          <Upload className="w-8 h-8 text-zinc-300 light:text-zinc-700" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-zinc-100 light:text-zinc-900">
          Drop your files here
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 mt-1">
          or <span className="text-zinc-100 font-semibold underline underline-offset-4 light:text-zinc-900">click to browse</span> from your device
        </p>

        {/* Format Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900/90 text-zinc-300 border border-zinc-800 light:bg-zinc-100 light:text-zinc-700 light:border-zinc-200">
            <FileImage className="w-3.5 h-3.5 text-emerald-400" />
            Images (JPG, PNG, GIF, WEBP, AVIF, SVG)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900/90 text-zinc-300 border border-zinc-800 light:bg-zinc-100 light:text-zinc-700 light:border-zinc-200">
            <FileVideo className="w-3.5 h-3.5 text-purple-400" />
            Videos (MP4, WEBM, MOV, MKV)
          </span>
        </div>

        <p className="text-[11px] text-zinc-500 light:text-zinc-500 mt-3">
          Maximum file size: {maxMb} MB &middot; Multiple files supported
        </p>
      </div>

      {/* Selected Files Queue */}
      <FileList
        files={queuedFiles}
        onRemove={handleRemoveQueuedFile}
        isUploading={isUploading}
      />

      {/* Expiration Configuration */}
      <div className="rounded-2xl glass-panel p-5 border border-zinc-800/80 light:border-zinc-300">
        <ExpirationPicker value={expiration} onChange={setExpiration} />
      </div>

      {/* Upload Action Button */}
      {queuedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
            isUploading
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : 'bg-zinc-100 hover:bg-white text-zinc-950 hover:shadow-zinc-200/10 light:bg-zinc-900 light:hover:bg-black light:text-white active:scale-[0.99]'
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
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
