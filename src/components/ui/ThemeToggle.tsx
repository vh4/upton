'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full bg-zinc-900/60 light:bg-zinc-200/80 border border-zinc-800 light:border-zinc-300">
      <button
        onClick={() => setTheme('light')}
        title="Light theme"
        className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
          theme === 'light'
            ? 'bg-white text-zinc-900 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-100 light:hover:text-zinc-900'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        title="Dark theme"
        className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-zinc-800 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-100 light:hover:text-zinc-900'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setTheme('system')}
        title="System theme"
        className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
          theme === 'system'
            ? 'bg-zinc-800 text-white light:bg-white light:text-zinc-900 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-100 light:hover:text-zinc-900'
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
