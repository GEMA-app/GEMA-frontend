import type { UsuarioPermiso } from '@/types/usuario';

export const PERMISOS_UI = [
  { id: 'dashboard', nombre: 'Acceso dashboard' },
  { id: 'inventario', nombre: 'Gestión de inventario' },
  { id: 'configuracion', nombre: 'Edición de configuración' },
] as const;

const INVENTARIO_ROLES = new Set(['admin', 'supervisor', 'tecnico']);

export function buildPermisosFromRol(rolSlug: string): UsuarioPermiso[] {
  const normalized = rolSlug.trim().toLowerCase();

  return PERMISOS_UI.map((permiso) => {
    let activo = false;

    if (permiso.id === 'dashboard') {
      activo = true;
    } else if (permiso.id === 'inventario') {
      activo = INVENTARIO_ROLES.has(normalized);
    } else if (permiso.id === 'configuracion') {
      activo = normalized === 'admin';
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
