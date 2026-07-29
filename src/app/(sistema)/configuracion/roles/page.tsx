'use client';

import { Check, X, Loader2, Shield } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { buildPermisosMatrix } from '@/lib/roles';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC } from '@/lib/permisos';
import { RolBadge } from '@/components/ui/Badge';
import type { Rol } from '@/types/rol';

const COLUMNAS: ModuloRBAC[] = [
  MODULOS_RBAC.ACTIVOS,
  MODULOS_RBAC.MANTENIMIENTO,
  MODULOS_RBAC.INVENTARIO,
  MODULOS_RBAC.REPORTES,
  MODULOS_RBAC.ADMINISTRACION,
  MODULOS_RBAC.PREFERENCIAS,
];

const MODULOS_LABELS: Record<ModuloRBAC, string> = {
  activos: 'Activos',
  mantenimiento: 'Mantenimiento',
  inventario: 'Inventario',
  reportes: 'Reportes',
  administracion: 'Administración',
  preferencias: 'Preferencias',
};

function tienePermiso(rol: Rol, modulo: ModuloRBAC): boolean {
  const matrix = buildPermisosMatrix(rol.permisos);
  return ACCIONES_RBAC.some((accion) => matrix[`${modulo}:${accion}`]);
}

function RolRow({ rol }: { rol: Rol }) {
  return (
    <tr className="transition-colors hover:bg-gema-bg-light/60 dark:hover:bg-white/5">
      <td className="px-3 py-3 sm:px-4 sm:py-3.5">
        <RolBadge rol={rol.nombre} />
      </td>
      {COLUMNAS.map((modulo) => {
        const activo = tienePermiso(rol, modulo);
        return (
          <td key={modulo} className="px-2 py-3 text-center">
            <span
              title={MODULOS_LABELS[modulo]}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                activo
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-500 dark:text-red-400'
              }`}
            >
              {activo ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
          </td>
        );
      })}
    </tr>
  );
}

export default function RolesPage() {
  const { roles, loading, error, empty } = useRoles();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
          Roles y permisos
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50 font-body">
          Vista de solo lectura de los permisos por rol
        </p>
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        {error && empty ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <Shield className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gema-primary/10 dark:border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gema-bg-light dark:bg-gema-surface-dark-2 text-left">
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold uppercase tracking-wide text-gema-primary/60 dark:text-white/50 font-body">
                    Nombre del rol
                  </th>
                  {COLUMNAS.map((modulo) => (
                    <th
                      key={modulo}
                      className="px-2 py-2.5 sm:py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-gema-primary/60 dark:text-white/50 font-body"
                    >
                      {MODULOS_LABELS[modulo]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gema-primary/5 dark:divide-white/5 bg-white dark:bg-gema-surface-dark">
                {loading ? (
                  <tr aria-busy="true">
                    <td colSpan={COLUMNAS.length + 1} className="px-4 py-10 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
                    </td>
                  </tr>
                ) : empty ? (
                  <tr>
                    <td
                      colSpan={COLUMNAS.length + 1}
                      className="px-4 py-10 text-center text-sm text-gema-primary/50 dark:text-white/40"
                    >
                      No hay roles definidos.
                    </td>
                  </tr>
                ) : (
                  roles.map((rol) => <RolRow key={rol.id} rol={rol} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
