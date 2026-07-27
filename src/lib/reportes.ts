import { extractResource, extractResourceList, getAttr, getAttrNumber, type JsonApiResource } from '@/lib/jsonapi';
import { extractMetaFromResponse } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/common';
import type { Reporte, ReporteEstado, ReportePrioridad } from '@/types/reporte';

const PRIORIDADES: ReportePrioridad[] = ['critica', 'alta', 'media', 'baja'];
const ESTADOS: ReporteEstado[] = ['pendiente', 'en_proceso', 'atendido', 'resuelto', 'descartado', 'cancelado'];

export function normalizePrioridad(raw: string): ReportePrioridad {
  const v = raw.trim().toLowerCase() as ReportePrioridad;
  return PRIORIDADES.includes(v) ? v : 'media';
}

export function normalizeEstado(raw: string): ReporteEstado {
  const v = raw.trim().toLowerCase() as ReporteEstado;
  return ESTADOS.includes(v) ? v : 'pendiente';
}

const PRIORIDAD_LABELS: Record<ReportePrioridad, string> = {
  critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja',
};
const ESTADO_LABELS: Record<ReporteEstado, string> = {
  pendiente: 'Pendiente', en_proceso: 'En proceso', atendido: 'Atendido', resuelto: 'Resuelto', descartado: 'Descartado', cancelado: 'Cancelado',
};

export function formatPrioridad(p: string): string {
  return PRIORIDAD_LABELS[p as ReportePrioridad] ?? p;
}

export function formatEstado(e: string): string {
  return ESTADO_LABELS[e as ReporteEstado] ?? e;
}

export function mapReporteFromApi(resource: JsonApiResource): Reporte {
  const rawId = resource.id;
  const codigoAttr = getAttr(resource, 'codigo') || getAttr(resource, 'codigo_reporte');
  const shortId = rawId.length > 8 ? rawId.slice(0, 8).toUpperCase() : rawId.toUpperCase();

  return {
    id: rawId,
    title: getAttr(resource, 'title'),
    description: getAttr(resource, 'description'),
    location: getAttr(resource, 'location'),
    priority: normalizePrioridad(getAttr(resource, 'priority', 'media')),
    reported_by: getAttr(resource, 'reported_by'),
    status: normalizeEstado(getAttr(resource, 'status', 'pendiente')),
    activo_id: getAttr(resource, 'activo_id') || null,
    orden_trabajo_id: getAttr(resource, 'orden_trabajo_id') || null,
    created_at: getAttr(resource, 'created_at'),
    version: getAttrNumber(resource, 'version', 1),
    codigo: codigoAttr || `REP-${shortId}`,
    observaciones: getAttr(resource, 'observaciones') || null,
    tecnico: getAttr(resource, 'tecnico') || getAttr(resource, 'reported_by') || 'Sin asignar',
  };
}

export function mapReporteFromResponse(payload: unknown): Reporte | null {
  const resource = extractResource(payload);
  return resource ? mapReporteFromApi(resource) : null;
}

export function extractReportesFromResponse(payload: unknown): Reporte[] {
  return extractResourceList(payload).map(mapReporteFromApi);
}

export function extractReportesMeta(payload: unknown, page = 1, perPage = 15): PaginationMeta {
  return extractMetaFromResponse(payload, page, perPage);
}