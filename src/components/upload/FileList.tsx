'use client';

import React from 'react';
import { formatBytes, truncateFilename } from '@/lib/utils';
import { FileImage, FileVideo, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface QueuedFile {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  publicUrl?: string;
}

interface FileListProps {
  files: QueuedFile[];
  onRemove: (id: string) => void;
  isUploading: boolean;
}

export function FileList({ files, onRemove, isUploading }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-2 mt-4">
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 px-1 font-medium">
        <span>Selected Files ({files.length})</span>
        <span>
          Total:{' '}
          {formatBytes(
            files.reduce((sum, item) => sum + item.file.size, 0)
          )}
        </span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {files.map((item) => {
          const isImage = item.file.type.startsWith('image/');

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-zinc-100/90 border border-zinc-200/90 dark:bg-zinc-900/60 dark:border-zinc-800/80 flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    {isImage ? (
                      <FileImage className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <FileVideo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate"
                      title={item.file.name}
                    >
                      {truncateFilename(item.file.name, 35)}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">
                      {formatBytes(item.file.size)} &middot;{' '}
                      {item.file.type || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {item.status === 'uploading' && (
                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-700 dark:text-zinc-300" />
                      {item.progress}%
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                  {!isUploading && item.status === 'idle' && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 sm:p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors min-w-[32px] min-h-[32px] sm:min-w-[28px] sm:min-h-[28px] flex items-center justify-center touch-manipulation"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar during upload */}
              {item.status === 'uploading' && (
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-200"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Error feedback */}
              {item.status === 'error' && item.errorMessage && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {item.errorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
