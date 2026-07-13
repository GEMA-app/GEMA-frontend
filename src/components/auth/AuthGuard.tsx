'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ensureSessionRoles,
  getToken,
  hasAnyRole,
} from '@/lib/auth';

interface AuthGuardProps {
  children: ReactNode;
  roleRequired?: string | string[];
}

export function AuthGuard({ children, roleRequired }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        await ensureSessionRoles();
      } catch {
        router.replace('/login');
        return;
      }

      if (cancelled) {
        return;
      }

      if (roleRequired) {
        const required = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
        if (!hasAnyRole(required)) {
          router.replace('/unauthorized');
          return;
        }
      }

      setAuthorized(true);
      setChecking(false);
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router, roleRequired]);

  if (checking) {
    return (
      <div
        className="flex flex-1 items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EBE2D5] border-t-[#E5A93D]" />
        <span className="sr-only">Verificando acceso…</span>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
