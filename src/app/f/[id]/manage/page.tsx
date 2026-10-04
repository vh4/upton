'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { PublicFileRecord } from '@/types/file';
import { formatBytes } from '@/lib/utils';
import { formatExpirationStatus } from '@/lib/expiration/calc';
import { Trash2, AlertCircle, ArrowLeft, ShieldAlert, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { removeLocalUploadHistoryItem } from '@/lib/storage/history';
import Link from 'next/link';

export default function ManageFilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error } = useToast();

  const id = params?.id as string;
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [file, setFile] = useState<PublicFileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadFileInfo() {
      try {
        const res = await fetch(`/api/files/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load file information.');
        }
        setFile(data.file);
      } catch (err: any) {
        setErrorMessage(err?.message || 'File not found or expired.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadFileInfo();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!token.trim()) {
      error('Delete token is required.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: {
          'x-delete-token': token.trim(),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Deletion failed.');
      }

      removeLocalUploadHistoryItem(id);
      success('File deleted successfully.');
      router.push('/dashboard');
    } catch (err: any) {
      error(err?.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage || !file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 light:text-zinc-900">
          Cannot Manage File
        </h2>
        <p className="text-xs text-zinc-400 light:text-zinc-600 max-w-sm mt-2">
          {errorMessage || 'This file may have already been deleted or expired.'}
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs light:bg-zinc-900 light:text-white"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const expStatus = formatExpirationStatus(file.expires_at);

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-12 space-y-6">
      <Link
        href={`/f/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 light:text-zinc-600 light:hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to File Viewer</span>
      </Link>

      <div className="rounded-2xl glass-panel p-6 border border-zinc-800 shadow-xl light:border-zinc-300 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800 light:border-zinc-200">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 light:text-zinc-900">
              Manage / Delete File
            </h1>
            <p className="text-xs text-zinc-400 light:text-zinc-600">
              Uploader administration panel for this file
            </p>
          </div>
        </div>

        {/* File Details Summary */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 light:bg-zinc-100 light:border-zinc-200 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">File Name:</span>
            <span className="font-semibold text-zinc-200 light:text-zinc-800 truncate max-w-[260px]">
              {file.original_name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Size:</span>
            <span className="text-zinc-300 light:text-zinc-700">{formatBytes(file.file_size)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Expiration:</span>
            <span className="text-zinc-300 light:text-zinc-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              {expStatus.label}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Downloads:</span>
            <span className="text-zinc-300 light:text-zinc-700">{file.download_count}</span>
          </div>
        </div>

        {/* Delete Token Form */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-zinc-300 light:text-zinc-700">
            Delete Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your delete token..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500 light:bg-white light:border-zinc-300 light:text-zinc-900"
          />
          <p className="text-[11px] text-zinc-500">
            This token was issued when the file was uploaded. Deleting this file will permanently purge it from disk and database immediately.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 light:border-zinc-200">
          <Link
            href={`/f/${id}`}
            className="text-xs text-zinc-400 hover:text-zinc-200 light:text-zinc-600 flex items-center gap-1 font-medium"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || !token.trim()}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
