import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { buildOffsetQuery } from '@/lib/pagination';
import { extractPlanesFromResponse, extractPlanesMeta, mapPlanFromResponse } from '@/lib/planes-mantenimiento';
import type {
  ActualizarPlanInput,
  NuevoPlanInput,
  PlanMantenimiento,
  PlanesQuery,
  PlanesResponse,
} from '@/types/plan-mantenimiento';

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/planes-mantenimiento`;
}

export async function getPlanes(params: PlanesQuery = {}): Promise<PlanesResponse> {
  const url = await baseUrl();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const query = buildOffsetQuery({
    page,
    perPage,
    activo_id: params.activo_id,
    tipo: params.tipo,
    activo: params.activo !== undefined ? String(params.activo) : undefined,
  });
  const payload = await fetchWithAuth<unknown>(`${url}${query}`);
  return {
    planes: extractPlanesFromResponse(payload),
    meta: extractPlanesMeta(payload, page, perPage),
  };
}

export async function getPlanById(id: string): Promise<PlanMantenimiento> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  const plan = mapPlanFromResponse(payload);
  if (!plan) throw new Error('No se pudo interpretar el plan de mantenimiento.');
  return plan;
}

export async function createPlan(input: NuevoPlanInput): Promise<PlanMantenimiento> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'maintenance-plans',
        attributes: {
          activo_id: input.activo_id,
          nombre: input.nombre,
          tipo: input.tipo,
          intervalo_dias: input.intervalo_dias,
          proxima_ejecucion: input.proxima_ejecucion,
          tecnico_responsable_id: input.tecnico_responsable_id ?? null,
          descripcion_tareas: input.descripcion_tareas ?? null,
        },
      },
    },
  });
  const plan = mapPlanFromResponse(payload);
  if (!plan) throw new Error('No se pudo interpretar el plan creado.');
  return plan;
}

export async function updatePlan(id: string, input: ActualizarPlanInput): Promise<PlanMantenimiento> {
  const url = await baseUrl();
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) attributes[key] = value;
  }
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'maintenance-plans', attributes } },
  });
  const plan = mapPlanFromResponse(payload);
  if (!plan) throw new Error('No se pudo interpretar el plan actualizado.');
  return plan;
}

export async function deletePlan(id: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}