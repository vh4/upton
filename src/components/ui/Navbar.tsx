'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/70 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
          <Logo
            size={28}
            className="sm:w-[34px] sm:h-[34px] group-hover:scale-105 transition-transform drop-shadow-sm shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-xs sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors leading-tight">
              UP-TON
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono -mt-0.5 hidden sm:block">
              File Share
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Link
            href="/"
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] flex items-center justify-center ${
              pathname === '/'
                ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
          >
            Upload
          </Link>

          <Link
            href="/dashboard"
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] flex items-center justify-center ${
              pathname === '/dashboard'
                ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/reset"
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-1 min-h-[36px] ${
              pathname === '/reset'
                ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold border border-rose-500/30'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
            title="Admin Storage Reset"
          >
            <Shield className="w-3.5 h-3.5 text-rose-500" />
            <span>Reset</span>
          </Link>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-800 mx-0.5 sm:mx-1 shrink-0" />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* GitHub Repo (visible on tablet/desktop to save mobile navbar space) */}
          <a
            href="https://github.com/vh4/upton"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40 transition-colors shrink-0"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
