'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getRoles } from '@/lib/auth';
import { hasPermisoAccion, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos-rbac';

interface PermissionGuardProps {
  module: ModuloRBAC;
  action?: AccionRBAC;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  module,
  action = 'view',
  children,
  fallback = null,
}: PermissionGuardProps) {
  const [mounted, setMounted] = useState(false);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const roles = getRoles();
    const allowed = roles.some((r) => hasPermisoAccion(r, module, action));
    setCanAccess(allowed);
    setMounted(true);
  }, [module, action]);

  if (!mounted) return null;
  if (!canAccess) return <>{fallback}</>;
  return <>{children}</>;
}
