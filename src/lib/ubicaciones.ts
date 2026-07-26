import type { Ubicacion, TipoUbicacion } from '@/types/ubicacion';
import type { JsonApiResource } from '@/lib/jsonapi';

export function mapTreeResource(resource: JsonApiResource): Ubicacion {
  const attrs = resource.attributes;
  const children = Array.isArray(attrs.children)
    ? attrs.children.map((child: unknown) => mapTreeResource(child as JsonApiResource))
    : undefined;
  return {
    id: resource.id,
    nombre: (attrs.nombre as string) || '',
    tipo: (attrs.tipo as TipoUbicacion) || 'sede',
    descripcion: (attrs.descripcion as string) || null,
    version: (attrs.version as number) || 1,
    parentId: (attrs.parent_id as string) || null,
    hijos: children,
  };
}

export function mapUbicacionFromApi(resource: JsonApiResource): Ubicacion {
  const attrs = resource.attributes;
  return {
    id: resource.id,
    nombre: (attrs.nombre as string) || '',
    tipo: (attrs.tipo as TipoUbicacion) || 'sede',
    descripcion: (attrs.descripcion as string) || null,
    version: (attrs.version as number) || 1,
    parentId: (attrs.parent_id as string) || null,
  };
}


export function flattenUbicacionesForSelect(
  ubicaciones: Ubicacion[],
  depth = 0,
): { id: string; label: string }[] {
  return ubicaciones.flatMap((ubicacion) => {
    const prefix = depth > 0 ? `${'— '.repeat(depth)}` : '';
    const current = { id: ubicacion.id, label: `${prefix}${ubicacion.nombre}` };
    const children = ubicacion.hijos ? flattenUbicacionesForSelect(ubicacion.hijos, depth + 1) : [];
    return [current, ...children];
  });
}

export function ubicacionMatchesQuery(ubicacion: Ubicacion, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    ubicacion.nombre.toLowerCase().includes(normalized) ||
    ubicacion.tipo.toLowerCase().includes(normalized) ||
    (ubicacion.descripcion?.toLowerCase().includes(normalized) ?? false)
  );
}

export function filterUbicaciones(ubicaciones: Ubicacion[], query: string): Ubicacion[] {
  if (!query.trim()) return ubicaciones;

  return ubicaciones.flatMap((ubicacion) => {
    const filteredChildren = ubicacion.hijos ? filterUbicaciones(ubicacion.hijos, query) : [];
    if (ubicacionMatchesQuery(ubicacion, query)) {
      return [{ ...ubicacion, hijos: filteredChildren.length ? filteredChildren : ubicacion.hijos }];
    }
    if (filteredChildren.length > 0) {
      return [{ ...ubicacion, hijos: filteredChildren }];
    }
    return [];
  });
}

export function collectExpandableIds(ubicaciones: Ubicacion[]): string[] {
  return ubicaciones.flatMap((ubicacion) => {
    const childIds = ubicacion.hijos ? collectExpandableIds(ubicacion.hijos) : [];
    return ubicacion.hijos?.length ? [ubicacion.id, ...childIds] : childIds;
  });
}

export interface FlatUbicacionRow {
  ubicacion: Ubicacion;
  depth: number;
  hasChildren: boolean;
}

export function flattenVisibleRows(
  ubicaciones: Ubicacion[],
  expandedIds: Set<string>,
  depth = 0,
): FlatUbicacionRow[] {
  return ubicaciones.flatMap((ubicacion) => {
    const hasChildren = Boolean(ubicacion.hijos?.length);
    const rows: FlatUbicacionRow[] = [{ ubicacion, depth, hasChildren }];

    if (hasChildren && expandedIds.has(ubicacion.id)) {
      rows.push(...flattenVisibleRows(ubicacion.hijos!, expandedIds, depth + 1));
    }

    return rows;
  });
}
