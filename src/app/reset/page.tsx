'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Trash2,
  RefreshCw,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileImage,
  FileVideo,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useToast } from '@/components/ui/Toast';
import { formatBytes } from '@/lib/utils';
import Link from 'next/link';

interface StorageMetrics {
  totalFiles: number;
  activeFiles: number;
  expiredFiles: number;
  permanentFiles: number;
  imageFiles: number;
  videoFiles: number;
  totalBytes: number;
  maxBytes: number;
  usedPercent: number;
  isFull: boolean;
}

interface StorageFile {
  id: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  expires_at: string | null;
  status: string;
  public_url: string;
  is_expired: boolean;
  is_permanent: boolean;
}

export default function ResetStoragePage() {
  const { success, error, info } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Action States
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isCleaningExpired, setIsCleaningExpired] = useState(false);

  // Check auth and fetch data
  const fetchStatus = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/status');
      if (res.status === 401) {
        setIsAuthenticated(false);
        setIsLoadingData(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setMetrics(data.metrics);
        setFiles(data.files || []);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      error('Harap masukkan username dan password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success('Login admin berhasil!');
        setIsAuthenticated(true);
        await fetchStatus();
      } else {
        error(data.error || 'Username atau password salah.');
      }
    } catch {
      error('Gagal terhubung ke server login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
      info('Anda telah keluar dari sesi admin.');
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Handle Clean Expired Files Only
  const handleCleanExpired = async () => {
    if (isCleaningExpired) return;
    setIsCleaningExpired(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'expired' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || 'Pembersihan file expired selesai.');
        await fetchStatus();
      } else {
        error(data.error || 'Gagal membersihkan file expired.');
      }
    } catch {
      error('Terjadi kesalahan saat memproses pembersihan.');
    } finally {
      setIsCleaningExpired(false);
    }
  };

  // Handle Full Reset Storage (Delete All Files)
  const handleExecuteFullReset = async () => {
    if (confirmInput.trim().toUpperCase() !== 'RESET') {
      error('Ketik "RESET" dengan huruf kapital untuk mengonfirmasi.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || 'Storage berhasil di-reset sepenuhnya!');
        setShowConfirmModal(false);
        setConfirmInput('');
        await fetchStatus();
      } else {
        error(data.error || 'Gagal mereset storage.');
      }
    } catch {
      error('Terjadi kesalahan jaringan saat mereset storage.');
    } finally {
      setIsResetting(false);
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) =>
    f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state during initial session check
  if (isAuthenticated === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">Memeriksa autentikasi admin...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated -> Show Admin Login Form
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg dark:bg-zinc-100 dark:text-zinc-950 mb-1">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Storage Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">
              Hanya administrator yang memiliki wewenang untuk mereset dan membersihkan storage file.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Username Admin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-200 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-200 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Panel Reset</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
            >
              &larr; Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  const usedBytes = metrics?.totalBytes || 0;
  const maxBytes = metrics?.maxBytes || 1024 * 1024 * 1024;
  const usedPercent = metrics?.usedPercent || 0;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-6 sm:py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Admin Mode
            </span>
            <span className="text-xs text-zinc-500">Kapasitas: 1 GB Max</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            Storage Control & Reset
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            Kelola file, pantau kapasitas storage 1 GB, dan lakukan reset/pembersihan file.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={isLoadingData}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Storage Gauge & 1 GB Capacity Card */}
      <div className="p-5 sm:p-7 rounded-3xl glass-panel border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Penggunaan Kapasitas Storage
              </h3>
              <p className="text-xs text-zinc-500">
                Batas maksimum server: <strong>1.00 GB</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              {formatBytes(usedBytes)}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {' '}/ {formatBytes(maxBytes)} ({usedPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usedPercent > 90
                ? 'bg-rose-500'
                : usedPercent > 70
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(1, usedPercent)}%` }}
          />
        </div>

        {/* Storage Notice & Auto-reset Info */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Kebijakan Reset Storage:</strong> Total storage dibatasi <strong>1 GB</strong>. Sistem akan <strong>otomatis me-reset (clean) seluruh file</strong> jika kapasitas penuh. File berstatus <em>Permanent</em> juga akan terhapus saat terjadi reset storage.
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 font-medium">Total Files</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {metrics?.totalFiles ?? 0}
          </p>
          <span className="text-[11px] text-zinc-400">
            {metrics?.imageFiles ?? 0} foto &middot; {metrics?.videoFiles ?? 0} video
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 font-medium">File Aktif</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics?.activeFiles ?? 0}
          </p>
          <span className="text-[11px] text-zinc-400">Dapat diakses publik</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 font-medium">File Expired</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {metrics?.expiredFiles ?? 0}
          </p>
          <span className="text-[11px] text-zinc-400">Siap dibersihkan</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 font-medium">File Permanent</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics?.permanentFiles ?? 0}
          </p>
          <span className="text-[11px] text-zinc-400">Hapus saat reset</span>
        </div>
      </div>

      {/* Action Controls Section */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Aksi Pembersihan & Reset Storage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1: Clean Expired Only */}
          <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-emerald-500" />
                Bersihkan File Expired
              </h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Hapus file-file yang masa berlakunya telah habis tanpa mengganggu file yang masih aktif atau permanent.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCleanExpired}
              disabled={isCleaningExpired || (metrics?.expiredFiles === 0)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isCleaningExpired ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  <span>Membersihkan...</span>
                </>
              ) : (
                <span>Bersihkan ({metrics?.expiredFiles ?? 0} Expired)</span>
              )}
            </button>
          </div>

          {/* Action 2: Full Storage Reset */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Reset Seluruh Storage (Hapus Semua File)
              </h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Kosongkan seluruh storage file di Supabase Storage / disk lokal dan bersihkan seluruh database file (termasuk file permanent).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Seluruh Storage Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Files List Table */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Daftar File di Storage ({files.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Menampilkan seluruh metadata file yang terdaftar di database.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama file..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            {files.length === 0 ? 'Storage sedang kosong. Tidak ada file yang tersimpan.' : 'Tidak ada file yang cocok dengan pencarian.'}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <th className="py-2.5 px-3 font-semibold">Nama File</th>
                  <th className="py-2.5 px-3 font-semibold">Ukuran</th>
                  <th className="py-2.5 px-3 font-semibold">Tipe</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Waktu Dibuat</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 max-w-xs sm:max-w-sm truncate">
                        {file.mime_type.startsWith('image/') ? (
                          <FileImage className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <FileVideo className="w-4 h-4 text-purple-500 shrink-0" />
                        )}
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate" title={file.original_name}>
                          {file.original_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {formatBytes(file.file_size)}
                    </td>
                    <td className="py-3 px-3 text-zinc-500">
                      {file.mime_type}
                    </td>
                    <td className="py-3 px-3">
                      {file.is_expired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Expired
                        </span>
                      ) : file.is_permanent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          Permanent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(file.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={file.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        title="Buka File"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Full Storage Reset */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100">
                  Konfirmasi Reset Storage
                </h3>
                <p className="text-xs text-zinc-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-2 leading-relaxed">
              <p>
                Anda akan menghapus <strong>seluruh {files.length} file</strong> dari penyimpanan dan mengosongkan database.
              </p>
              <p className="text-rose-600 dark:text-rose-400 font-semibold">
                Semua file termasuk file permanent akan terhapus permanen.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Ketik <strong className="text-rose-600 font-mono">RESET</strong> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="RESET"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmInput('');
                }}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteFullReset}
                disabled={isResetting || confirmInput.trim().toUpperCase() !== 'RESET'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isResetting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Mereset Storage...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Semua File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
