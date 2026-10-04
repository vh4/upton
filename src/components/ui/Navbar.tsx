'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, HardDrive, Layers, Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md light:border-zinc-200 light:bg-white/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform light:bg-zinc-900 light:text-white">
            ↑
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-base text-zinc-100 light:text-zinc-900 group-hover:text-white transition-colors">
              UPTON
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
                ? 'bg-zinc-800/80 text-white light:bg-zinc-200 light:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 light:text-zinc-600 light:hover:text-zinc-900'
            }`}
          >
            Upload
          </Link>

          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-zinc-800/80 text-white light:bg-zinc-200 light:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 light:text-zinc-600 light:hover:text-zinc-900'
            }`}
          >
            Dashboard
          </Link>

          <div className="h-4 w-[1px] bg-zinc-800 light:bg-zinc-300 mx-1 sm:mx-2" />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* GitHub Repo */}
          <a
            href="https://github.com/vh4/upton"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors light:text-zinc-600 light:hover:text-zinc-900"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
