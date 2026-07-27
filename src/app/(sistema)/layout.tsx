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
  const [isDark, setIsDark] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem(THEME_STORAGE_KEY) !== 'light');
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  if (!isAuthed) return null;

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <div className={`${sora.variable} ${inter.variable} ${isDark ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isDark={isDark} onToggleTheme={toggleTheme} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
