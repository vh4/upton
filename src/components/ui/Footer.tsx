import React from 'react';
import { ShieldCheck, HardDrive, Database, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/60 bg-zinc-950/40 mt-auto py-8 light:border-zinc-200 light:bg-white/40">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs">
            ↑
          </div>
          <span className="font-semibold text-zinc-300 light:text-zinc-700">UPTON</span>
          <span>&copy; {new Date().getFullYear()} Modern File Sharing. Upload. Share. Done.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-zinc-400 light:text-zinc-600">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            Local /file Storage
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400 light:text-zinc-600">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            Supabase PostgreSQL
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400 light:text-zinc-600">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Auto-Expiration Engine
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400 light:text-zinc-600">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Token-Protected Deletion
          </span>
        </div>
      </div>
    </footer>
  );
}
