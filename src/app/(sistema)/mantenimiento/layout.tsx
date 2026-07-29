'use client';

import React from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function MantenimientoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard 
      module="mantenimiento" 
      action="view"
      fallback={
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-3xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            No tienes los permisos necesarios para ver el módulo de mantenimiento. 
            Contacta al administrador del sistema si necesitas acceso.
          </p>
        </div>
      }
    >
      {children}
    </PermissionGuard>
  );
}
