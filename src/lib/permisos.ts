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
