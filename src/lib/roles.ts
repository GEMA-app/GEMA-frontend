import { extractResourceList, extractResource, type JsonApiResource } from '@/lib/jsonapi';
import type { Rol, PermisoGranular } from '@/types/rol';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos';

const MODULO_VALUES = Object.values(MODULOS_RBAC) as ModuloRBAC[];
const ACCION_VALUES = [...ACCIONES_RBAC] as AccionRBAC[];

function parsePermisos(raw: unknown): PermisoGranular[] {
  if (!Array.isArray(raw)) return [];
  const map = new Map<ModuloRBAC, AccionRBAC[]>();
  for (const modulo of MODULO_VALUES) map.set(modulo, []);
  for (const item of raw) {
    if (typeof item === 'string') {
      const [modulo, accion] = item.split(':') as [string, string];
      if (!modulo || !accion) continue;
      if (!MODULO_VALUES.includes(modulo as ModuloRBAC)) continue;
      if (!ACCION_VALUES.includes(accion as AccionRBAC)) continue;
      map.get(modulo as ModuloRBAC)!.push(accion as AccionRBAC);
    } else if (typeof item === 'object' && item) {
      const obj = item as Record<string, unknown>;
      const modulo = obj.modulo ?? obj.module;
      if (!MODULO_VALUES.includes(modulo as ModuloRBAC)) continue;

      const acciones: AccionRBAC[] = [];
      if (obj.can_view || obj.canView) acciones.push('view');
      if (obj.can_create || obj.canCreate) acciones.push('create');
      if (obj.can_edit || obj.canEdit) acciones.push('edit');
      if (obj.can_delete || obj.canDelete) acciones.push('delete');

      // Also support raw arrays if present
      const rawAcciones = obj.acciones ?? obj.actions ?? obj.permisos;
      if (Array.isArray(rawAcciones)) {
        for (const a of rawAcciones) {
          if (ACCION_VALUES.includes(a as AccionRBAC) && !acciones.includes(a as AccionRBAC)) {
            acciones.push(a as AccionRBAC);
          }
        }
      }

      for (const a of acciones) {
        map.get(modulo as ModuloRBAC)!.push(a);
      }
    }
  }
  return MODULO_VALUES.map(m => ({ modulo: m, acciones: map.get(m) || [] })).filter(p => p.acciones.length > 0);
}

export function permisosToStrings(permisos: PermisoGranular[]): string[] {
  const result: string[] = [];
  for (const p of permisos) for (const a of p.acciones) result.push(`${p.modulo}:${a}`);
  return result;
}

export function permisosToApi(permisos: PermisoGranular[]): Array<{
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}> {
  const modules = Object.values(MODULOS_RBAC);
  return modules.map(m => {
    const p = permisos.find(x => x.modulo === m);
    const acciones = p ? p.acciones : [];
    return {
      module: m,
      can_view: acciones.includes('view'),
      can_create: acciones.includes('create'),
      can_edit: acciones.includes('edit'),
      can_delete: acciones.includes('delete'),
    };
  });
}

export function mapRolFromApi(resource: JsonApiResource): Rol {
  const attrs = resource.attributes;
  return {
    id: resource.id,
    nombre: (attrs.nombre as string) || 'Sin nombre',
    descripcion: (attrs.descripcion as string | undefined) ?? undefined,
    permisos: parsePermisos(attrs.permisos ?? attrs.permissions ?? []),
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

export function buildPermisosMatrix(permisos: PermisoGranular[]): Record<string, boolean> {
  const matrix: Record<string, boolean> = {};
  for (const modulo of MODULO_VALUES) for (const a of ACCION_VALUES) matrix[`${modulo}:${a}`] = false;
  for (const p of permisos) for (const a of p.acciones) matrix[`${p.modulo}:${a}`] = true;
  return matrix;
}

export function matrixToPermisos(matrix: Record<string, boolean>): PermisoGranular[] {
  return MODULO_VALUES.map(m => ({
    modulo: m,
    acciones: ACCION_VALUES.filter(a => matrix[`${m}:${a}`]),
  })).filter(p => p.acciones.length > 0);
}
