'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-300 active:scale-95",
        "bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#242424]",
        "text-slate-600 dark:text-slate-400 hover:text-[#FF2D2D] dark:hover:text-white",
        "shadow-sm dark:shadow-none",
        className
      )}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="animate-in fade-in zoom-in duration-500" />
      ) : (
        <Moon size={20} className="animate-in fade-in zoom-in duration-500" />
      )}
    </button>
  );
}
