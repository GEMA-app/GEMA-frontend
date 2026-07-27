import type { UsuarioPermiso } from '@/types/usuario';
import { MODULOS_RBAC, rolSlugFromLabel, type ModuloRBAC } from './permisos-rbac';

export { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from './permisos-rbac';

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

/** Mapa: id de PERMISOS_UI → módulo en MATRIZ_RBAC (null si no existe en RBAC) */
const UI_TO_MODULE: Record<string, ModuloRBAC | null> = {
  dashboard: null,
  activos: 'activos',
  inventario: 'inventario',
  mantenimiento: 'mantenimiento',
  reportes: 'reportes',
  preferencias: 'preferencias',
  administracion: 'administracion',
  configuracion: null,
};

export function buildPermisosFromRol(rolSlug: string): UsuarioPermiso[] {
  const normalized = rolSlug.trim().toLowerCase();
  const { MATRIZ_RBAC } = require('./permisos-rbac');

  return PERMISOS_UI.map((permiso) => {
    let activo = false;
    const modulo = UI_TO_MODULE[permiso.id];

    if (permiso.id === 'dashboard') {
      activo = true;
    } else if (permiso.id === 'configuracion') {
      activo = FULL_ACCESS.has(normalized);
    } else if (modulo) {
      const row = MATRIZ_RBAC[normalized];
      activo = row?.[modulo]?.view ?? false;
    }

    return { id: permiso.id, nombre: permiso.nombre, activo };
  });
}

// Re-export para compatibilidad con import existentes
export { rolSlugFromLabel } from './permisos-rbac';
