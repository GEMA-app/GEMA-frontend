'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { clearSession, getToken } from '@/lib/auth';
import { fetchWithAuth } from '@/lib/api';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    if (getToken()) {
      try {
        await fetchWithAuth('/v1/auth/cerrar-sesion', { method: 'POST' });
      } catch {
        // cerrar sesión igual aunque falle el request
      }
    }
    clearSession();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gema-bg-light dark:bg-gema-bg-dark flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-gema-surface-dark border border-gray-200 dark:border-white/10 p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gema-accent/10">
          <ShieldAlert className="h-10 w-10 text-gema-accent" strokeWidth={1.5} aria-hidden />
        </div>
        <h1 className="font-sora font-bold text-3xl text-gema-primary dark:text-white mb-3">
          Acceso restringido
        </h1>
        <p className="text-sm text-gema-primary/60 dark:text-white/60 mb-8">
          No tienes permisos para acceder a esta sección. Contacta al administrador de tu empresa.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-gema-accent hover:bg-gema-accent/90 px-5 py-2.5 text-sm font-semibold text-gema-bg-dark transition-colors cursor-pointer"
          >
            Volver al dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 px-5 py-2.5 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
