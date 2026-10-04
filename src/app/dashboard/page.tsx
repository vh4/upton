'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getLocalUploadHistory,
  removeLocalUploadHistoryItem,
  clearLocalUploadHistory,
} from '@/lib/storage/history';
import { StoredUploadHistoryItem, PublicFileRecord } from '@/types/file';
import { formatBytes, truncateFilename } from '@/lib/utils';
import { formatExpirationStatus } from '@/lib/expiration/calc';
import { useToast } from '@/components/ui/Toast';
import {
  FileImage,
  FileVideo,
  Copy,
  Check,
  ExternalLink,
  Download,
  Trash2,
  Clock,
  Upload,
  RefreshCw,
  HardDrive,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const { success, error } = useToast();
  const [historyItems, setHistoryItems] = useState<StoredUploadHistoryItem[]>([]);
  const [liveFiles, setLiveFiles] = useState<Record<string, PublicFileRecord>>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLiveStatus = async (items: StoredUploadHistoryItem[]) => {
    if (items.length === 0) {
      setLiveFiles({});
      setLoading(false);
      return;
    }

    try {
      const ids = items.map((x) => x.id);
      const res = await fetch('/api/files/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      if (res.ok && data.files) {
        const fileMap: Record<string, PublicFileRecord> = {};
        data.files.forEach((f: PublicFileRecord) => {
          fileMap[f.id] = f;
        });
        setLiveFiles(fileMap);
      }
    } catch (err) {
      console.warn('Failed to load batch status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const items = getLocalUploadHistory();
    setHistoryItems(items);
    fetchLiveStatus(items);
  }, []);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success('Share link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string, deleteToken: string) => {
    if (!confirm('Are you sure you want to permanently delete this file?')) return;

    try {
      const res = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: {
          'x-delete-token': deleteToken,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete file.');
      }

      removeLocalUploadHistoryItem(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      success('File permanently deleted.');
    } catch (err: any) {
      error(err?.message || 'Could not delete file.');
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear your local upload history? (Files will remain until their expiration time)')) {
      clearLocalUploadHistory();
      setHistoryItems([]);
      setLiveFiles({});
      success('Upload history cleared.');
    }
  };

  const totalSize = historyItems.reduce((acc, curr) => acc + curr.file_size, 0);

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Upload History
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-1">
            Files uploaded from this device &amp; browser session
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-medium transition-colors min-h-[38px] touch-manipulation"
            >
              Clear History
            </button>
          )}

          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm min-h-[38px] touch-manipulation"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {historyItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/70">
            <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase font-semibold">Total Uploads</span>
            <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 sm:mt-1">
              {historyItems.length}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/70">
            <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase font-semibold">Storage Volume</span>
            <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 sm:mt-1">
              {formatBytes(totalSize)}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/70 col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase font-semibold">Device Storage Mode</span>
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1">
              Local Persistent (/file)
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {historyItems.length === 0 && !loading && (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl glass-panel border border-zinc-200 dark:border-zinc-800/80 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-100 border border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              No uploads yet.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              Upload your first image or video to get started.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold text-xs transition-all shadow-md min-h-[40px]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </Link>
        </div>
      )}

      {/* File List (Mobile Card View + Desktop Table View) */}
      {historyItems.length > 0 && (
        <div className="rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-xl">
          {/* Mobile Card View (visible on < sm screens) */}
          <div className="block sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {historyItems.map((item) => {
              const live = liveFiles[item.id];
              const expStatus = formatExpirationStatus(item.expires_at);
              const isImage = item.mime_type.startsWith('image/');

              return (
                <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center shrink-0">
                      {isImage ? (
                        <FileImage className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <FileVideo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/f/${item.id}`}
                        className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate block"
                        title={item.original_name}
                      >
                        {truncateFilename(item.original_name, 35)}
                      </Link>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.mime_type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                    <span>{formatBytes(item.file_size)}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        expStatus.badgeVariant === 'permanent'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : expStatus.badgeVariant === 'warning'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : expStatus.badgeVariant === 'expired'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {expStatus.label}
                    </span>
                    <span>Downloads: {live?.download_count ?? '—'}</span>
                  </div>

                  {/* Touch-Friendly Action Buttons on Mobile */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/50">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.public_url, item.id)}
                      className="py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1 text-[11px] font-medium min-h-[34px] touch-manipulation"
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/f/${item.id}`}
                      className="py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1 text-[11px] font-medium min-h-[34px] touch-manipulation"
                      title="View File"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    <a
                      href={`/api/files/${item.id}/download`}
                      className="py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1 text-[11px] font-medium min-h-[34px] touch-manipulation"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.delete_token)}
                      className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-400 flex items-center justify-center gap-1 text-[11px] font-medium min-h-[34px] touch-manipulation"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (visible on >= sm screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-center">Downloads</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {historyItems.map((item) => {
                  const live = liveFiles[item.id];
                  const expStatus = formatExpirationStatus(item.expires_at);
                  const isImage = item.mime_type.startsWith('image/');

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Name + Thumbnail icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center shrink-0">
                            {isImage ? (
                              <FileImage className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <FileVideo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/f/${item.id}`}
                              className="font-medium text-zinc-900 hover:text-black dark:text-zinc-200 dark:hover:text-white truncate block max-w-xs"
                              title={item.original_name}
                            >
                              {truncateFilename(item.original_name, 30)}
                            </Link>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {item.mime_type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        {formatBytes(item.file_size)}
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            expStatus.badgeVariant === 'permanent'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : expStatus.badgeVariant === 'warning'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : expStatus.badgeVariant === 'expired'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {expStatus.label}
                        </span>
                      </td>

                      {/* Downloads */}
                      <td className="py-3.5 px-4 text-center text-zinc-600 dark:text-zinc-400 font-mono">
                        {live?.download_count ?? '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(item.public_url, item.id)}
                            title="Copy Public URL"
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:hover:text-white transition-colors"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <Link
                            href={`/f/${item.id}`}
                            title="View File"
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <a
                            href={`/api/files/${item.id}/download`}
                            title="Download"
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:hover:text-white transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.delete_token)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 dark:bg-zinc-800/80 dark:hover:bg-rose-950/60 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
