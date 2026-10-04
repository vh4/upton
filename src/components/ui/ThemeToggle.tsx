'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full bg-zinc-200/80 border border-zinc-300 dark:bg-zinc-900/80 dark:border-zinc-800 transition-colors">
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light theme"
        className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
          theme === 'light'
            ? 'bg-white text-zinc-900 shadow-sm font-semibold'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark theme"
        className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-zinc-800 text-white shadow-sm font-semibold'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System theme"
        className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
          theme === 'system'
            ? 'bg-white text-zinc-900 shadow-sm font-semibold dark:bg-zinc-800 dark:text-white'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
