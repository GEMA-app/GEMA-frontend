'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Ruta relativa segura que sube dos niveles desde app/(sistema) hasta src/
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { sora, inter } from '@/lib/fonts';

import { usePreferencias } from '@/hooks/usePreferencias';

const THEME_STORAGE_KEY = 'gema-theme';

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const { preferencia, cambiarTema } = usePreferencias();

  useEffect(() => {
    setIsDark(localStorage.getItem(THEME_STORAGE_KEY) !== 'light');
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  useEffect(() => {
    if (preferencia) {
      let darkFromBackend = false;
      if (preferencia.tema === 'oscuro') {
        darkFromBackend = true;
      } else if (preferencia.tema === 'claro') {
        darkFromBackend = false;
      } else if (typeof window !== 'undefined') {
        darkFromBackend = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDark(darkFromBackend);
      localStorage.setItem(THEME_STORAGE_KEY, darkFromBackend ? 'dark' : 'light');
    }
  }, [preferencia]);

  useEffect(() => {
    function handleCustomThemeChange(e: Event) {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setIsDark(customEvent.detail);
      }
    }
    window.addEventListener('gema-theme-change', handleCustomThemeChange);
    return () => window.removeEventListener('gema-theme-change', handleCustomThemeChange);
  }, []);

  if (!isAuthed) return null;

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      void cambiarTema(next ? 'oscuro' : 'claro');
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
