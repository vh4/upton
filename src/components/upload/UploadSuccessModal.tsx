'use client';

import React, { useState } from 'react';
import { UploadedFileResponse } from '@/types/file';
import { CheckCircle2, Copy, Check, ExternalLink, Trash2, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatBytes, truncateFilename } from '@/lib/utils';
import { formatExpirationStatus } from '@/lib/expiration/calc';
import Link from 'next/link';

interface UploadSuccessModalProps {
  results: UploadedFileResponse[];
  onReset: () => void;
}

export function UploadSuccessModal({ results, onReset }: UploadSuccessModalProps) {
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success('Public share link copied to clipboard!');
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  return (
    <div className="w-full rounded-2xl glass-panel p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Upload Completed!
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {results.length} file{results.length > 1 ? 's are' : ' is'} ready to share.
          </p>
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {results.map(({ file, delete_token, manage_url }) => {
          const expStatus = formatExpirationStatus(file.expires_at);

          return (
            <div
              key={file.id}
              className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate"
                    title={file.original_name}
                  >
                    {truncateFilename(file.original_name, 35)}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span>{formatBytes(file.file_size)}</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {expStatus.label}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/f/${file.id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium text-xs flex items-center gap-1.5 hover:bg-black transition-all dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shrink-0"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Public URL Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={file.public_url}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs font-mono text-zinc-800 select-all focus:outline-none dark:bg-zinc-950 dark:border-zinc-700/80 dark:text-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(file.public_url, file.id)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 shrink-0"
                >
                  {copiedId === file.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Delete / Manage link note */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
                <span>Manage &amp; manual delete link:</span>
                <Link
                  href={manage_url}
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3 text-rose-500" />
                  <span>Manage File</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <Link
          href="/dashboard"
          className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View all in Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-xs font-semibold text-zinc-900 transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
        >
          Upload More Files
        </button>
      </div>
    </div>
  );
}
