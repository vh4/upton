import React from 'react';
import { ShieldCheck, HardDrive, Database, Clock } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/80 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-950/40 mt-auto py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Logo size={20} className="rounded" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">UP-TON</span>
          <span>&copy; {new Date().getFullYear()} Modern File Sharing. Upload. Share. Done.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            Local /file Storage
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            Supabase PostgreSQL
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Auto-Expiration Engine
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            Token-Protected Deletion
          </span>
        </div>
      </div>
    </footer>
  );
}
