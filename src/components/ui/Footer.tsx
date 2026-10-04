import React from 'react';
import { ShieldCheck, HardDrive, Database, Clock, Coffee } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/80 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-950/40 mt-auto py-6 sm:py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 flex flex-col items-center gap-4 sm:gap-5 text-xs text-zinc-500 dark:text-zinc-400 text-center">
        {/* Top row: Brand & Buy Me a Coffee */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <Logo size={20} className="rounded shrink-0" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">UP-TON</span>
            <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} Modern File Sharing. Upload. Share. Done.
            </span>
          </div>

          <a
            href="https://buymeacoffee.com/fathoniwasl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-zinc-900 bg-[#FFDD00] hover:bg-[#FFDD00]/90 dark:bg-[#FFDD00] dark:text-zinc-950 shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 touch-manipulation group shrink-0 min-h-[38px]"
            aria-label="Buy me a coffee"
          >
            <Coffee className="w-4 h-4 text-zinc-900 transition-transform group-hover:rotate-12 duration-200" />
            <span>Buy me a coffee</span>
          </a>
        </div>

        {/* Feature badges row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 w-full">
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Local /file Storage
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            Supabase PostgreSQL
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Auto-Expiration Engine
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            Token-Protected Deletion
          </span>
        </div>
      </div>
    </footer>
  );
}

