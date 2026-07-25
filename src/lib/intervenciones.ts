import { extractResource, extractResourceList, getAttr, getAttrNumber, type JsonApiResource } from '@/lib/jsonapi';
import { extractMetaFromResponse } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/common';
import type { Intervencion } from '@/types/intervencion';
import type { RepuestoUtilizado } from '@/types/repuesto-utilizado';

export function mapRepuestoUtilizado(raw: unknown): RepuestoUtilizado {
  const item = (raw ?? {}) as Record<string, unknown>;
  const toNumber = (v: unknown): number | null =>
    typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) : null;
  return {
    id: String(item.id ?? ''),
    intervencion_id: String(item.intervencion_id ?? ''),
    repuesto_id: String(item.repuesto_id ?? ''),
    cantidad_usada: typeof item.cantidad_usada === 'number' ? item.cantidad_usada : 0,
    precio_unitario: toNumber(item.precio_unitario),
    moneda: String(item.moneda ?? 'USD'),
    precio_total: toNumber(item.precio_total),
    created_at: (item.created_at as string) ?? null,
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