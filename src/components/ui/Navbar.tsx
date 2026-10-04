'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/70 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo size={34} className="group-hover:scale-105 transition-transform drop-shadow-sm" />
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-base text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
              UP-TON
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono -mt-1">
              File Share
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
          >
            Upload
          </Link>

          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
          >
            Dashboard
          </Link>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-800 mx-1 sm:mx-2" />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* GitHub Repo */}
          <a
            href="https://github.com/vh4/upton"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
