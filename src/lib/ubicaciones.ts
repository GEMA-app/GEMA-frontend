import type { EstadoUbicacion, NuevaUbicacionForm, ProcesoUbicacion, Ubicacion } from '@/types/ubicacion';

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord | null {
  return value && typeof value === 'object' ? (value as ApiRecord) : null;
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return fallback;
}

function normalizeProceso(value: unknown): ProcesoUbicacion {
  const normalized = asString(value, 'media').toLowerCase();
  if (normalized === 'alta' || normalized === 'high') {
    return 'alta';
  }
  if (normalized === 'baja' || normalized === 'low') {
    return 'baja';
  }
  return 'media';
}

function normalizeEstado(value: unknown): EstadoUbicacion {
  const normalized = asString(value, 'pendiente').toLowerCase();

  if (normalized.includes('complet')) {
    return 'completado';
  }
  if (normalized.includes('progres') || normalized.includes('activ')) {
    return 'en_progreso';
  }
  return 'pendiente';
}

export function flattenBackendTree(payload: Record<string, unknown>, parentId?: string): Record<string, unknown>[] {
  const data = payload.data;
  if (!Array.isArray(data)) return [];

  const results: Record<string, unknown>[] = [];
  for (const item of data) {
    const record = item as Record<string, unknown>;
    const attrs = (record.attributes as Record<string, unknown>) ?? {};
    const children = attrs.children;
    const flatItem = {
      ...record,
      attributes: { ...attrs, parent_id: parentId },
    };
    delete (flatItem.attributes as Record<string, unknown>).children;
    results.push(flatItem);
    if (Array.isArray(children)) {
      const sub = flattenBackendTree(
        { data: children } as Record<string, unknown>,
        record.id as string,
      );
      results.push(...sub);
    }
  }
  return results;
}

export function mapApiUbicacionToUi(raw: unknown): Ubicacion | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const attributes = asRecord(record.attributes) ?? record;
  const id = asString(record.id ?? attributes.id);
  if (!id) {
    return null;
  }

  return {
    id,
    nombre: asString(attributes.nombre, `Ubicación ${id}`),
    jerarquia: asString(attributes.descripcion, asString(attributes.nombre, '')),
    tipo: asString(attributes.tipo, 'area'),
    proceso: normalizeProceso(attributes.proceso ?? 'media'),
    estado: normalizeEstado(attributes.estado ?? 'completado'),
    parentId: asString(
      attributes.parent_id ?? attributes.parentId,
      undefined,
    ) || undefined,
  };
}

export function extractUbicacionesFromResponse(payload: unknown): Ubicacion[] {
  if (Array.isArray(payload)) {
    return payload.map(mapApiUbicacionToUi).filter((item): item is Ubicacion => item !== null);
  }

  const record = asRecord(payload);
  if (!record) {
    return [];
  }

  const data = record.data;
  if (Array.isArray(data)) {
    return data.map(mapApiUbicacionToUi).filter((item): item is Ubicacion => item !== null);
  }

  const ubicaciones = record.ubicaciones;
  if (Array.isArray(ubicaciones)) {
    return ubicaciones.map(mapApiUbicacionToUi).filter((item): item is Ubicacion => item !== null);
  }

  return [];
}

export function buildUbicacionTree(flatList: Ubicacion[]): Ubicacion[] {
  const nodes = new Map<string, Ubicacion>();
  const roots: Ubicacion[] = [];

  for (const item of flatList) {
    nodes.set(item.id, { ...item, hijos: [] });
  }

  for (const item of flatList) {
    const node = nodes.get(item.id);
    if (!node) {
      continue;
    }

    if (item.parentId && nodes.has(item.parentId)) {
      const parent = nodes.get(item.parentId)!;
      parent.hijos = [...(parent.hijos ?? []), node];
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function mapUiUbicacionToApiPayload(data: NuevaUbicacionForm): ApiRecord {
  return {
    nombre: data.nombre,
    jerarquia: data.jerarquia,
    tipo: data.tipo,
    proceso: data.proceso,
    estado: data.estado,
    parent_id: data.parentId ?? null,
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
  if (!normalized) {
    return true;
  }

  return (
    ubicacion.nombre.toLowerCase().includes(normalized) ||
    ubicacion.jerarquia.toLowerCase().includes(normalized) ||
    ubicacion.tipo.toLowerCase().includes(normalized)
  );
}

export function filterUbicaciones(ubicaciones: Ubicacion[], query: string): Ubicacion[] {
  if (!query.trim()) {
    return ubicaciones;
  }

  const results: Ubicacion[] = [];

  for (const ubicacion of ubicaciones) {
    const filteredChildren = ubicacion.hijos ? filterUbicaciones(ubicacion.hijos, query) : [];
    const selfMatches = ubicacionMatchesQuery(ubicacion, query);

    if (selfMatches) {
      results.push(ubicacion);
      continue;
    }

    if (filteredChildren.length > 0) {
      results.push({
        ...ubicacion,
        hijos: filteredChildren,
      });
    }
  }

  return results;
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
