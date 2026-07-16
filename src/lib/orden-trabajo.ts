import { extractResource, extractResourceList, getAttr, getAttrNumber } from '@/lib/jsonapi';
import type { EstadoOT, OrdenTrabajo, TipoMantenimiento } from '@/types/orden-trabajo';

export function mapOrdenFromResource(raw: unknown): OrdenTrabajo | null {
  const resource = extractResource(raw);
  if (!resource) return null;
  return {
    id: resource.id,
    company_id: getAttr(resource, 'company_id'),
    codigo_ot: getAttr(resource, 'codigo_ot'),
    activo_id: getAttr(resource, 'activo_id'),
    tipo: getAttr(resource, 'tipo') as OrdenTrabajo['tipo'],
    estado: getAttr(resource, 'estado') as OrdenTrabajo['estado'],
    reporte_id: getAttr(resource, 'reporte_id') || null,
    supervisor_id: getAttr(resource, 'supervisor_id') || null,
    fecha_apertura: getAttr(resource, 'fecha_apertura') || null,
    fecha_inicio_trabajo: getAttr(resource, 'fecha_inicio_trabajo') || null,
    fecha_cierre: getAttr(resource, 'fecha_cierre') || null,
    descripcion_trabajo: getAttr(resource, 'descripcion_trabajo') || null,
    costo_estimado: getAttrNumber(resource, 'costo_estimado'),
    costo_real: getAttrNumber(resource, 'costo_real'),
    moneda: getAttr(resource, 'moneda') || 'USD',
    validado_por_id: getAttr(resource, 'validado_por_id') || null,
    fecha_validacion: getAttr(resource, 'fecha_validacion') || null,
    version: getAttrNumber(resource, 'version') ?? 1,
  };
}

export function extractOrdenesFromResponse(payload: unknown): OrdenTrabajo[] {
  return extractResourceList(payload)
    .map(mapOrdenFromResource)
    .filter((o): o is OrdenTrabajo => o !== null);
}

export function extractOrdenesMeta(payload: unknown, page = 1, perPage = 15): {
  total: number; offset: number; limit: number; lastPage: number; page: number; hasMore: boolean;
} {
  const meta = (payload as Record<string, unknown>)?.meta as Record<string, unknown> | undefined;
  const total = typeof meta?.total === 'number' ? meta.total : 0;
  const offset = typeof meta?.offset === 'number' ? meta.offset : 0;
  const limit = typeof meta?.limit === 'number' ? meta.limit : perPage;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  return { total, offset, limit, lastPage, page, hasMore: page < lastPage };
}

export function formatEstadoOT(estado: string): string {
  const map: Record<string, string> = {
    abierta: 'Abierta',
    en_proceso: 'En progreso',
    pausada: 'Pausada',
    cerrada: 'Cerrada',
    cancelada: 'Cancelada',
  };
  return map[estado] || estado;
}

export function formatTipoMantenimiento(tipo: string): string {
  const map: Record<string, string> = {
    preventivo: 'Preventivo',
    correctivo: 'Correctivo',
    predictivo: 'Predictivo',
  };
  return map[tipo] || tipo;
}

export function formatCosto(valor: number | null, moneda = 'USD'): string {
  if (valor == null) return '—';
  return `${valor.toLocaleString('es-VE')} ${moneda}`;
}
