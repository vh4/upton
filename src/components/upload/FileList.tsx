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
      <div className="flex items-center justify-between text-xs text-zinc-400 light:text-zinc-600 px-1">
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
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 light:bg-zinc-100/90 light:border-zinc-200/90 flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 light:bg-zinc-200 flex items-center justify-center shrink-0">
                    {isImage ? (
                      <FileImage className="w-4 h-4 text-emerald-400 light:text-emerald-600" />
                    ) : (
                      <FileVideo className="w-4 h-4 text-purple-400 light:text-purple-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-medium text-zinc-200 light:text-zinc-900 truncate"
                      title={item.file.name}
                    >
                      {truncateFilename(item.file.name, 40)}
                    </p>
                    <p className="text-[11px] text-zinc-500 light:text-zinc-500">
                      {formatBytes(item.file.size)} &middot;{' '}
                      {item.file.type || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'uploading' && (
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
                      {item.progress}%
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  {!isUploading && item.status === 'idle' && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 light:hover:text-zinc-800 light:hover:bg-zinc-200 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar during upload */}
              {item.status === 'uploading' && (
                <div className="w-full bg-zinc-800 light:bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-zinc-100 light:bg-zinc-900 h-full rounded-full transition-all duration-200"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Error feedback */}
              {item.status === 'error' && item.errorMessage && (
                <p className="text-[11px] text-rose-400">
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
