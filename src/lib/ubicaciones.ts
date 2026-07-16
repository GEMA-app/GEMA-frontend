import type { Ubicacion } from '@/types/ubicacion';

export function buildUbicacionTree(flatList: Ubicacion[]): Ubicacion[] {
  const nodes = new Map<string, Ubicacion>();
  const roots: Ubicacion[] = [];

  for (const item of flatList) {
    nodes.set(item.id, { ...item, hijos: [] });
  }

  for (const item of flatList) {
    const node = nodes.get(item.id);
    if (!node) continue;

    if (item.parentId && nodes.has(item.parentId)) {
      const parent = nodes.get(item.parentId)!;
      parent.hijos = [...(parent.hijos ?? []), node];
    } else {
      roots.push(node);
    }
  }

  return roots;
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
