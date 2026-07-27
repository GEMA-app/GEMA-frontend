import type { UsuarioPermiso } from '@/types/usuario';

export const PERMISOS_UI = [
  { id: 'dashboard', nombre: 'Acceso dashboard' },
  { id: 'activos', nombre: 'Gestión de activos' },
  { id: 'inventario', nombre: 'Gestión de inventario' },
  { id: 'mantenimiento', nombre: 'Gestión de mantenimiento' },
  { id: 'reportes', nombre: 'Gestión de reportes' },
  { id: 'preferencias', nombre: 'Preferencias' },
  { id: 'administracion', nombre: 'Administración del sistema' },
  { id: 'configuracion', nombre: 'Edición de configuración' },
] as const;

const FULL_ACCESS = new Set(['admin']);
const ALL_USERS = new Set(['admin', 'supervisor', 'tecnico', 'reporter']);
const OPERATIONAL = new Set(['admin', 'supervisor', 'tecnico']);
const READ_REPORTS = new Set(['admin', 'supervisor', 'reporter']);

export function buildPermisosFromRol(rolSlug: string): UsuarioPermiso[] {
  const normalized = rolSlug.trim().toLowerCase();

  return PERMISOS_UI.map((permiso) => {
    let activo = false;

    if (permiso.id === 'dashboard') {
      activo = true;
    } else if (permiso.id === 'activos') {
      activo = OPERATIONAL.has(normalized);
    } else if (permiso.id === 'inventario') {
      activo = OPERATIONAL.has(normalized);
    } else if (permiso.id === 'mantenimiento') {
      activo = OPERATIONAL.has(normalized);
    } else if (permiso.id === 'reportes') {
      activo = READ_REPORTS.has(normalized);
    } else if (permiso.id === 'preferencias') {
      activo = ALL_USERS.has(normalized);
    } else if (permiso.id === 'administracion') {
      activo = FULL_ACCESS.has(normalized);
    } else if (permiso.id === 'configuracion') {
      activo = FULL_ACCESS.has(normalized);
    }

    return {
      id: permiso.id,
      nombre: permiso.nombre,
      activo,
    };
  });
}

export function rolSlugFromLabel(rol: string): string {
  const normalized = rol.trim().toLowerCase();
  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('supervisor')) return 'supervisor';
  if (normalized.includes('técnico') || normalized.includes('tecnico')) return 'tecnico';
  if (normalized.includes('reporter')) return 'reporter';
  return normalized;
}

// ── Constantes RBAC (alineadas con PermissionModule del backend) ──
// Estos módulos corresponden 1:1 con los PermissionModule del backend.
// Usar en PermissionGuard y en hasPermission() cuando se implemente en Fase 8.

export const MODULOS_RBAC = {
  ACTIVOS: 'activos',
  MANTENIMIENTO: 'mantenimiento',
  INVENTARIO: 'inventario',
  REPORTES: 'reportes',
  ADMINISTRACION: 'administracion',
  PREFERENCIAS: 'preferencias',
} as const;

export const ACCIONES_RBAC = ['view', 'create', 'edit', 'delete'] as const;

export type ModuloRBAC = (typeof MODULOS_RBAC)[keyof typeof MODULOS_RBAC];
export type AccionRBAC = (typeof ACCIONES_RBAC)[number];

type PermisoMatrix = Record<string, boolean>;

function buildAccionesPorRol(rol: string): PermisoMatrix {
  const matrix: PermisoMatrix = {};
  for (const m of Object.values(MODULOS_RBAC)) {
    for (const a of ACCIONES_RBAC) {
      matrix[`${m}:${a}`] = false;
    }
  }

  if (rol === 'admin') {
    for (const m of Object.values(MODULOS_RBAC)) {
      for (const a of ACCIONES_RBAC) {
        matrix[`${m}:${a}`] = true;
      }
    }
    return matrix;
  }

  const operativos = new Set<ModuloRBAC>(['activos', 'mantenimiento', 'inventario']);
  const puedeEditar = new Set(['supervisor', 'tecnico']);
  const puedeVerReportes = new Set(['supervisor', 'reporter']);

  for (const modulo of operativos) {
    matrix[`${modulo}:view`] = puedeEditar.has(rol);
    matrix[`${modulo}:create`] = puedeEditar.has(rol);
    matrix[`${modulo}:edit`] = puedeEditar.has(rol);
  }

  if (puedeVerReportes.has(rol)) {
    matrix['reportes:view'] = true;
  }

  return matrix;
}

export function hasPermisoAccion(rol: string, modulo: ModuloRBAC, accion: AccionRBAC): boolean {
  const matrix = buildAccionesPorRol(rol);
  return matrix[`${modulo}:${accion}`] ?? false;
}
