import { extractResource, extractResourceList, getAttr, getAttrBoolean, getAttrNumber, type JsonApiResource } from '@/lib/jsonapi';
import { extractMetaFromResponse } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/common';
import type { EjecucionPlan, PlanMantenimiento } from '@/types/plan-mantenimiento';
import type { TipoMantenimiento } from '@/types/plan-mantenimiento';

const TIPOS: TipoMantenimiento[] = ['preventivo', 'correctivo', 'predictivo'];

function normalizeTipo(raw: string): TipoMantenimiento {
  const v = raw.trim().toLowerCase() as TipoMantenimiento;
  return TIPOS.includes(v) ? v : 'preventivo';
}

function mapEjecuciones(raw: unknown): EjecucionPlan[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e) => {
    const item = (e ?? {}) as Record<string, unknown>;
    return {
      id: String(item.id ?? ''),
      plan_id: String(item.plan_id ?? ''),
      work_order_id: String(item.work_order_id ?? ''),
      execution_date: String(item.execution_date ?? ''),
      observations: (item.observations as string) ?? null,
      created_at: (item.created_at as string) ?? null,
    };
  });
}

export function mapPlanFromApi(resource: JsonApiResource): PlanMantenimiento {
  return {
    id: resource.id,
    empresa_id: getAttr(resource, 'empresa_id'),
    activo_id: getAttr(resource, 'activo_id'),
    nombre: getAttr(resource, 'nombre'),
    tipo: normalizeTipo(getAttr(resource, 'tipo', 'preventivo')),
    intervalo_dias: getAttrNumber(resource, 'intervalo_dias'),
    proxima_ejecucion: getAttr(resource, 'proxima_ejecucion'),
    tecnico_responsable_id: getAttr(resource, 'tecnico_responsable_id') || null,
    descripcion_tareas: getAttr(resource, 'descripcion_tareas') || null,
    activo: getAttrBoolean(resource, 'activo', true),
    es_urgente: getAttrBoolean(resource, 'es_urgente'),
    version: getAttrNumber(resource, 'version', 1),
    created_at: getAttr(resource, 'created_at') || null,
    updated_at: getAttr(resource, 'updated_at') || null,
    ejecuciones: mapEjecuciones(resource.attributes.ejecuciones),
  };
}

export function mapPlanFromResponse(payload: unknown): PlanMantenimiento | null {
  const resource = extractResource(payload);
  return resource ? mapPlanFromApi(resource) : null;
}

export function extractPlanesFromResponse(payload: unknown): PlanMantenimiento[] {
  return extractResourceList(payload).map(mapPlanFromApi);
}

export function extractPlanesMeta(payload: unknown, page = 1, perPage = 15): PaginationMeta {
  return extractMetaFromResponse(payload, page, perPage);
}