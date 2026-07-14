import {
  extractResourceList,
  extractResource,
  type JsonApiResource,
} from '@/lib/jsonapi';
import type { Rol, PermisoGranular } from '@/types/rol';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos';

const MODULO_VALUES = Object.values(MODULOS_RBAC) as ModuloRBAC[];
const ACCION_VALUES = [...ACCIONES_RBAC] as AccionRBAC[];

/**
 * Convierte la lista de permisos del backend (formato "modulo:accion")
 * a la estructura PermisoGranular[] del frontend.
 */
function parsePermisos(raw: unknown): PermisoGranular[] {
  if (!Array.isArray(raw)) return [];

  const map = new Map<ModuloRBAC, AccionRBAC[]>();
  for (const modulo of MODULO_VALUES) {
    map.set(modulo, []);
  }

  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const [modulo, accion] = item.split(':') as [string, string];
    if (!modulo || !accion) continue;
    if (!MODULO_VALUES.includes(modulo as ModuloRBAC)) continue;
    if (!ACCION_VALUES.includes(accion as AccionRBAC)) continue;
    map.get(modulo as ModuloRBAC)!.push(accion as AccionRBAC);
  }

  return MODULO_VALUES
    .map((modulo) => ({ modulo, acciones: map.get(modulo) || [] }))
    .filter((p) => p.acciones.length > 0);
}

/**
 * Convierte PermisoGranular[] a formato de string "modulo:accion" para enviar al backend.
 */
export function permisosToStrings(permisos: PermisoGranular[]): string[] {
  const result: string[] = [];
  for (const p of permisos) {
    for (const accion of p.acciones) {
      result.push(`${p.modulo}:${accion}`);
    }
  }
  return result;
}

export function mapRolFromApi(resource: JsonApiResource): Rol {
  const attrs = resource.attributes;
  const permisosRaw = attrs.permisos ?? attrs.permissions ?? [];

  return {
    id: resource.id,
    nombre: (attrs.nombre as string) || 'Sin nombre',
    permisos: parsePermisos(permisosRaw),
    version: (attrs.version as number) || 1,
  };
}

export function extractRolesFromResponse(payload: unknown): Rol[] {
  return extractResourceList(payload).map(mapRolFromApi);
}

export function extractRolFromResponse(payload: unknown): Rol | null {
  const resource = extractResource(payload);
  if (!resource) return null;
  return mapRolFromApi(resource);
}

/**
 * Genera una matriz de permisos para la UI de checkboxes.
 * 6 módulos × 4 acciones = 24 checkboxes.
 */
export function buildPermisosMatrix(permisos: PermisoGranular[]): Record<string, boolean> {
  const matrix: Record<string, boolean> = {};
  for (const modulo of MODULO_VALUES) {
    for (const accion of ACCION_VALUES) {
      matrix[`${modulo}:${accion}`] = false;
    }
  }
  for (const p of permisos) {
    for (const accion of p.acciones) {
      matrix[`${p.modulo}:${accion}`] = true;
    }
  }
  return matrix;
}

/**
 * Convierte una matriz de checkboxes (Record<string, boolean>) a PermisoGranular[].
 */
export function matrixToPermisos(matrix: Record<string, boolean>): PermisoGranular[] {
  const result: PermisoGranular[] = [];
  for (const modulo of MODULO_VALUES) {
    const acciones = ACCION_VALUES.filter((accion) => matrix[`${modulo}:${accion}`]);
    if (acciones.length > 0) {
      result.push({ modulo, acciones });
    }
  }
  return result;
}
