'use client';

import { Check, X, Loader2, Shield } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { buildPermisosMatrix } from '@/lib/roles';
import { MODULOS_RBAC, ACCIONES_RBAC, hasPermisoAccion, rolSlugFromLabel, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos-rbac';
import type { Rol } from '@/types/rol';

const ROLES_COLUMNAS = [
  'Administrador',
  'Supervisor de Activos',
  'Técnico de Mantenimiento',
  'Almacenista',
  'Supervisor de Operaciones',
  'Consultor (Solo Lectura)',
] as const;

const ACCION_LABELS: Record<AccionRBAC, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

interface FilaModulo {
  label: string;
  modulo: ModuloRBAC | 'configuracion-ui';
  acciones: AccionRBAC[];
}

const FILAS: FilaModulo[] = [
  { label: 'Activos', modulo: MODULOS_RBAC.ACTIVOS, acciones: ['view', 'create', 'edit', 'delete'] },
  { label: 'Mantenimiento', modulo: MODULOS_RBAC.MANTENIMIENTO, acciones: ['view', 'create', 'edit', 'delete'] },
  { label: 'Inventario', modulo: MODULOS_RBAC.INVENTARIO, acciones: ['view', 'create', 'edit', 'delete'] },
  { label: 'Reportes', modulo: MODULOS_RBAC.REPORTES, acciones: ['view'] },
  { label: 'Usuarios', modulo: MODULOS_RBAC.ADMINISTRACION, acciones: ['view', 'create', 'edit'] },
  { label: 'Configuración', modulo: 'configuracion-ui', acciones: ['view', 'edit'] },
];

function tienePermiso(
  apiRol: Rol | undefined,
  rolLabel: string,
  modulo: FilaModulo['modulo'],
  accion: AccionRBAC,
): boolean {
  if (modulo === 'configuracion-ui') {
    return rolSlugFromLabel(rolLabel) === 'admin';
  }
  if (apiRol) {
    const matrix = buildPermisosMatrix(apiRol.permisos);
    return matrix[`${modulo}:${accion}`] ?? false;
  }
  return hasPermisoAccion(rolLabel, modulo, accion);
}

export default function RolesPage() {
  const { roles, loading, error, empty } = useRoles();

  const rolesPorColumna = ROLES_COLUMNAS.map((label) => ({
    label,
    apiRol: roles.find((r) => rolSlugFromLabel(r.nombre) === rolSlugFromLabel(label)),
  }));

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
          Roles y permisos
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50 font-body">
          Matriz de permisos por módulo y rol
        </p>
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        {error && empty ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <Shield className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
          </div>
        ) : (
          <div className="overflow-auto rounded-2xl border border-gema-primary/10 dark:border-white/10 max-h-[70vh]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 left-0 z-20 bg-gema-bg-light dark:bg-gema-surface-dark-2 px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gema-primary/60 dark:text-white/50 font-body whitespace-nowrap"
                  >
                    Módulo
                  </th>
                  {rolesPorColumna.map((col) => (
                    <th
                      key={col.label}
                      scope="col"
                      className="sticky top-0 z-10 bg-gema-bg-light dark:bg-gema-surface-dark-2 px-3 py-2.5 sm:px-4 sm:py-3 text-center text-xs font-semibold uppercase tracking-wide text-gema-primary/60 dark:text-white/50 font-body whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gema-primary/5 dark:divide-white/5 bg-white dark:bg-gema-surface-dark">
                {FILAS.map((fila) => (
                  <tr key={fila.label} className="transition-colors hover:bg-gema-bg-light/60 dark:hover:bg-white/5">
                    <td className="sticky left-0 z-10 bg-white dark:bg-gema-surface-dark px-3 py-3 sm:px-4 sm:py-3.5 font-semibold text-gema-primary dark:text-white whitespace-nowrap">
                      {fila.label}
                    </td>
                    {rolesPorColumna.map((col) => (
                      <td key={col.label} className="px-3 py-3 sm:px-4 sm:py-3.5">
                        <div className="flex flex-col items-start gap-1.5">
                          {fila.acciones.map((accion) => {
                            const activo = tienePermiso(col.apiRol, col.label, fila.modulo, accion);
                            return (
                              <div key={accion} className="flex items-center gap-1.5 whitespace-nowrap">
                                {activo ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" strokeWidth={3} aria-label="Permitido" />
                                ) : (
                                  <X className="h-3.5 w-3.5 text-red-500 shrink-0" strokeWidth={3} aria-label="Denegado" />
                                )}
                                <span className="text-[11px] text-gema-primary/60 dark:text-white/50">
                                  {ACCION_LABELS[accion]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
