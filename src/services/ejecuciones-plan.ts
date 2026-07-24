import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResource, extractResourceList, getAttr, type JsonApiResource } from '@/lib/jsonapi';
import type { EjecucionPlan, NuevaEjecucionInput } from '@/types/plan-mantenimiento';

function mapEjecucion(resource: JsonApiResource): EjecucionPlan {
  return {
    id: resource.id,
    plan_id: getAttr(resource, 'plan_id'),
    work_order_id: getAttr(resource, 'work_order_id'),
    execution_date: getAttr(resource, 'execution_date'),
    observations: getAttr(resource, 'observations') || null,
    created_at: getAttr(resource, 'created_at') || null,
  };
}

async function baseUrl(planId: string): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/planes-mantenimiento/${planId}/ejecuciones`;
}

export async function getEjecuciones(planId: string): Promise<EjecucionPlan[]> {
  const url = await baseUrl(planId);
  const payload = await fetchWithAuth<unknown>(url);
  return extractResourceList(payload).map(mapEjecucion);
}

export async function getEjecucionById(planId: string, ejecucionId: string): Promise<EjecucionPlan> {
  const url = await baseUrl(planId);
  const payload = await fetchWithAuth<unknown>(`${url}/${ejecucionId}`);
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar la ejecucion.');
  return mapEjecucion(resource);
}

export async function createEjecucion(input: NuevaEjecucionInput): Promise<EjecucionPlan> {
  const url = await baseUrl(input.plan_id);
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'planExecution',
        attributes: {
          plan_id: input.plan_id,
          work_order_id: input.work_order_id,
          execution_date: input.execution_date ?? null,
          observations: input.observations ?? null,
        },
      },
    },
  });
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar la ejecucion creada.');
  return mapEjecucion(resource);
}