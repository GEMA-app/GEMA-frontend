'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getRoles } from '@/lib/auth';
import type { ModuloRBAC, AccionRBAC } from '@/lib/permisos';

interface PermissionGuardProps {
  module: ModuloRBAC;
  action: AccionRBAC;
  children: ReactNode;
  fallback?: ReactNode;
}

export function hasPermission(module: ModuloRBAC, action: AccionRBAC): boolean {
  const roles = getRoles();
  if (roles.includes('admin')) {
    return true;
  }

  if (action === 'delete') {
    // Solo administradores pueden realizar eliminaciones
    return false;
  }

  if (action === 'create' || action === 'edit') {
    return roles.some((r) => r === 'supervisor' || r === 'tecnico');
  }

  if (action === 'view') {
    return roles.some((r) => r === 'supervisor' || r === 'tecnico' || r === 'reporter');
  }

  return false;
}

export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const [canAccess, setCanAccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCanAccess(hasPermission(module, action));
    setMounted(true);
  }, [module, action]);

  if (!mounted) {
    return null;
  }

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
