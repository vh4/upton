'use client';

import React, { useState } from 'react';
import { PublicFileRecord } from '@/types/file';
import { formatBytes } from '@/lib/utils';
import { formatExpirationStatus } from '@/lib/expiration/calc';
import { useToast } from '@/components/ui/Toast';
import { Download, Copy, Check, Trash2, Clock, Eye, HardDrive, Calendar, ExternalLink } from 'lucide-react';
import { getLocalUploadHistory, removeLocalUploadHistoryItem } from '@/lib/storage/history';
import { useRouter } from 'next/navigation';

interface FileMetaCardProps {
  file: PublicFileRecord;
}

export function FileMetaCard({ file }: FileMetaCardProps) {
  const { success, error } = useToast();
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [downloadCount, setDownloadCount] = useState(file.download_count);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customToken, setCustomToken] = useState('');

  const expStatus = formatExpirationStatus(file.expires_at);

  // Check if we have the delete token stored in this browser's upload history
  const localHistory = getLocalUploadHistory();
  const savedItem = localHistory.find((item) => item.id === file.id);
  const knownDeleteToken = savedItem?.delete_token || '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.public_url);
    setCopied(true);
    success('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    setDownloadCount((prev) => prev + 1);
    // Open download link in browser
    window.location.href = file.download_url;
  };

  const executeDelete = async (tokenToUse: string) => {
    if (!tokenToUse) {
      error('Delete token is required.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: 'DELETE',
        headers: {
          'x-delete-token': tokenToUse,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete file.');
      }

      // Remove from local history
      removeLocalUploadHistoryItem(file.id);

      success('File deleted successfully.');
      setShowDeleteModal(false);
      // Redirect to home or dashboard
      router.push('/dashboard');
    } catch (err: any) {
      error(err?.message || 'Deletion failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl glass-panel p-6 border border-zinc-800/80 light:border-zinc-300 space-y-6">
        {/* Title and Expiration Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80 light:border-zinc-200">
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-bold text-zinc-100 light:text-zinc-900 break-all"
              title={file.original_name}
            >
              {file.original_name}
            </h1>
            <p className="text-xs text-zinc-400 light:text-zinc-600 mt-1 flex items-center gap-2">
              <span>{formatBytes(file.file_size)}</span>
              <span>&middot;</span>
              <span>{file.mime_type}</span>
            </p>
          </div>

          {/* Expiration Badge */}
          <div className="shrink-0 flex items-center">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                expStatus.badgeVariant === 'permanent'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : expStatus.badgeVariant === 'warning'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                  : expStatus.badgeVariant === 'expired'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {expStatus.label}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] light:bg-zinc-900 light:hover:bg-black light:text-white"
          >
            <Download className="w-4 h-4" />
            <span>Download ({downloadCount})</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-medium text-sm flex items-center justify-center gap-2 transition-all light:bg-zinc-100 light:hover:bg-zinc-200 light:text-zinc-800 light:border-zinc-300"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Share URL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-rose-400 border border-zinc-800 hover:border-rose-900/60 font-medium text-sm flex items-center justify-center gap-2 transition-all light:bg-zinc-100 light:hover:bg-rose-50 light:border-zinc-300"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete File</span>
          </button>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 light:bg-zinc-100/60 light:border-zinc-200 text-xs">
          <div>
            <span className="text-zinc-500 block mb-0.5">Uploaded</span>
            <span className="text-zinc-300 light:text-zinc-700 font-medium">
              {new Date(file.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block mb-0.5">Downloads</span>
            <span className="text-zinc-300 light:text-zinc-700 font-medium">
              {downloadCount} time{downloadCount === 1 ? '' : 's'}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block mb-0.5">Direct Raw Stream</span>
            <a
              href={file.raw_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white light:text-zinc-700 light:hover:text-black font-medium underline flex items-center gap-1"
            >
              <span>View Raw</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <span className="text-zinc-500 block mb-0.5">Storage Mode</span>
            <span className="text-zinc-300 light:text-zinc-700 font-medium">
              Local /file
            </span>
          </div>
        </div>
      </div>

      {/* Manual Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 border border-zinc-800 shadow-2xl light:border-zinc-300 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100 light:text-zinc-900">
                  Delete File
                </h3>
                <p className="text-xs text-zinc-400 light:text-zinc-600">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {knownDeleteToken ? (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 light:bg-zinc-100 light:border-zinc-200">
                <p className="font-semibold text-emerald-400 mb-1">
                  ✓ Authorized Uploader
                </p>
                <p className="text-zinc-400">
                  Your delete token from this browser was automatically detected.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 block font-medium">
                  Enter Delete Token
                </label>
                <input
                  type="text"
                  placeholder="Paste your delete token here..."
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 light:bg-white light:border-zinc-300 light:text-zinc-900"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800 light:border-zinc-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 light:text-zinc-600 light:hover:text-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDelete(knownDeleteToken || customToken)}
                disabled={isDeleting || (!knownDeleteToken && !customToken.trim())}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
