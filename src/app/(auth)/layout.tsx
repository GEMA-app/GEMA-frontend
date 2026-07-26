'use client';

import { useState } from 'react';
import { sora, inter } from '@/lib/fonts';

const THEME_STORAGE_KEY = 'gema-theme';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(THEME_STORAGE_KEY) !== 'light';
  });

  return (
    <div
      className={`${isDark ? 'dark' : ''} ${sora.variable} ${inter.variable} font-body min-h-screen flex items-center justify-center bg-gema-bg-light dark:bg-gema-bg-dark p-4`}
    >
      {children}
    </div>
  );
}
