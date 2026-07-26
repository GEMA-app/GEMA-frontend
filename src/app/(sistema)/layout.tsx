'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Ruta relativa segura que sube dos niveles desde app/(sistema) hasta src/
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { sora, inter } from '@/lib/fonts';

const THEME_STORAGE_KEY = 'gema-theme';

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(THEME_STORAGE_KEY) !== 'light';
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <div className={`${isDark ? 'dark' : ''} ${sora.variable} ${inter.variable} font-body`}>
      <div className="flex h-screen bg-gema-bg-light dark:bg-gema-bg-dark overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isDark={isDark} onToggleTheme={toggleTheme} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
