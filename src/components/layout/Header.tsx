'use client';

import { useState } from 'react';
import { Bell, Moon, Sun, User } from 'lucide-react';
import { getUserName } from '@/lib/auth';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ isDark, onToggleTheme }: HeaderProps) {
  const [userName] = useState(() => getUserName() ?? 'Usuario');

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-white/10 dark:bg-gema-surface-dark/80 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="truncate font-heading text-base font-bold text-gema-primary dark:text-white sm:text-lg">
          Hola, {userName}
        </p>
        <p className="hidden text-xs text-gema-primary/50 dark:text-white/50 sm:block">
          Bienvenido de vuelta a GEMA
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gema-primary/70 transition-colors hover:bg-gema-primary/5 dark:text-white/70 dark:hover:bg-white/10 sm:h-10 sm:w-10"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          aria-label="Notificaciones"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gema-primary/70 transition-colors hover:bg-gema-primary/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10 sm:h-10 sm:w-10"
        >
          <Bell size={18} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Perfil"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gema-primary/70 transition-colors hover:bg-gema-primary/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10 sm:h-10 sm:w-10"
        >
          <User size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
