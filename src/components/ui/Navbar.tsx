'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Shield, Menu, X, UploadCloud, LayoutDashboard, Sun, Moon, Coffee } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/70 backdrop-blur-md transition-colors duration-150">
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

        {/* Desktop Navigation Links (hidden on mobile to prevent overflow) */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] flex items-center justify-center ${
              pathname === '/'
                ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
          >
            Upload
          </Link>

          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] flex items-center justify-center ${
              pathname === '/dashboard'
                ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/reset"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-1 min-h-[36px] ${
              pathname === '/reset'
                ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold border border-rose-500/30'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
            }`}
            title="Admin Storage Reset"
          >
            <Shield className="w-3.5 h-3.5 text-rose-500" />
            <span>Reset</span>
          </Link>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-800 mx-1 shrink-0" />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* GitHub Repo */}
          <a
            href="https://github.com/vh4/upton"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="inline-flex p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40 transition-colors shrink-0"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>

        {/* Mobile Right Controls: Quick Theme Toggle & Hamburger */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 transition-colors touch-manipulation"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-zinc-200/80 bg-white/95 dark:border-zinc-800/80 dark:bg-zinc-950/95 backdrop-blur-xl px-3 py-3.5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[42px] ${
                pathname === '/'
                  ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Upload Files</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[42px] ${
                pathname === '/dashboard'
                  ? 'bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800/80 dark:text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-500 shrink-0" />
              <span>My Dashboard</span>
            </Link>

            <Link
              href="/reset"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[42px] ${
                pathname === '/reset'
                  ? 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400 font-semibold border border-rose-500/30'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Shield className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Admin Storage Reset</span>
            </Link>
          </div>

          <div className="pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Theme Preference</span>
            <ThemeToggle />
          </div>

          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
            <a
              href="https://buymeacoffee.com/fathoniwasl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-900 bg-[#FFDD00] hover:bg-[#FFDD00]/90 shadow-sm min-h-[36px]"
            >
              <Coffee className="w-3.5 h-3.5 text-zinc-900" />
              <span>Buy me a coffee</span>
            </a>

            <a
              href="https://github.com/vh4/upton"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 min-h-[36px]"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

