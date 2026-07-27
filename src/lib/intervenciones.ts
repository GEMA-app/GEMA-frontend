import { extractResource, extractResourceList, getAttr, getAttrNumber, type JsonApiResource } from '@/lib/jsonapi';
import { extractMetaFromResponse } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/common';
import type { Intervencion } from '@/types/intervencion';
import type { RepuestoUtilizado } from '@/types/repuesto-utilizado';

export function mapRepuestoUtilizado(raw: unknown): RepuestoUtilizado {
  const item = (raw ?? {}) as Record<string, unknown>;
  const attrs = (item.attributes ?? item) as Record<string, unknown>;
  const id = String(item.id ?? attrs.id ?? '');
  const toNumber = (v: unknown): number | null =>
    typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) : null;
  return {
    id,
    intervencion_id: String(attrs.intervencion_id ?? ''),
    repuesto_id: String(attrs.repuesto_id ?? ''),
    cantidad_usada: typeof attrs.cantidad_usada === 'number' ? attrs.cantidad_usada : 0,
    precio_unitario: toNumber(attrs.precio_unitario),
    moneda: String(attrs.moneda ?? 'USD'),
    precio_total: toNumber(attrs.precio_total),
    created_at: (attrs.created_at as string) ?? null,
    updated_at: (attrs.updated_at as string) ?? null,
  };
}

export function mapIntervencionFromApi(resource: JsonApiResource): Intervencion {
  const usedParts = Array.isArray(resource.attributes.used_parts)
    ? resource.attributes.used_parts.map(mapRepuestoUtilizado)
    : [];
  return {
    id: resource.id,
    work_order_id: getAttr(resource, 'work_order_id'),
    technician_id: getAttr(resource, 'technician_id'),
    tareas_realizadas: getAttr(resource, 'tareas_realizadas'),
    fecha_inicio: getAttr(resource, 'fecha_inicio'),
    fecha_fin: getAttr(resource, 'fecha_fin') || null,
    horas_hombre: getAttrNumber(resource, 'horas_hombre'),
    used_parts: usedParts,
  };
}

export function mapIntervencionFromResponse(payload: unknown): Intervencion | null {
  const resource = extractResource(payload);
  return resource ? mapIntervencionFromApi(resource) : null;
}

export function extractIntervencionesFromResponse(payload: unknown): Intervencion[] {
  return extractResourceList(payload).map(mapIntervencionFromApi);
}

export function extractIntervencionesMeta(payload: unknown, page = 1, perPage = 20): PaginationMeta {
  return extractMetaFromResponse(payload, page, perPage);
}