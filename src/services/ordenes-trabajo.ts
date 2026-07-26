import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResourceList, extractResource } from '@/lib/jsonapi';
import { buildOffsetQuery } from '@/lib/pagination';
import { mapHistorialFromApi, mapOrdenFromApi } from '@/lib/ordenes-trabajo';
import type {
  ActualizarOrdenTrabajoInput,
  AsignarTecnicoInput,
  CambiarEstadoOTInput,
  HistorialEstadoOT,
  NuevaOrdenTrabajoInput,
  OrdenTrabajo,
  OrdenesTrabajoResponse,
  OrdenTrabajoQuery,
} from '@/types/orden-trabajo';

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/ordenes-trabajo`;
}

export async function getOrdenesTrabajo(params: OrdenTrabajoQuery = {}): Promise<OrdenesTrabajoResponse> {
  const url = await baseUrl();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const baseQuery = buildOffsetQuery({ page, perPage });

  const queryParams = new URLSearchParams(baseQuery ? baseQuery.replace('?', '') : '');
  if (params.estado) queryParams.set('estado', params.estado);
  if (params.tipo) queryParams.set('tipo', params.tipo);
  if (params.activo_id) queryParams.set('activo_id', params.activo_id);
  if (params.supervisor_id) queryParams.set('supervisor_id', params.supervisor_id);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const payload = await fetchWithAuth<unknown>(url + queryString);
  const resources = extractResourceList(payload) as Array<{ id: string; attributes: Record<string, unknown> }>;
  const meta = (payload as { meta?: { total?: number; page?: number; per_page?: number; offset?: number; limit?: number } })?.meta;

  const total = meta?.total ?? 0;
  const limit = meta?.limit ?? meta?.per_page ?? perPage;
  return {
    ordenes: resources.map(mapOrdenFromApi),
    meta: {
      total,
      page: meta?.page ?? (meta?.offset !== undefined ? Math.floor(meta.offset / limit) + 1 : page),
      perPage: limit,
      lastPage: total > 0 ? Math.ceil(total / limit) : 1,
    },
  };
}

export async function getOrdenTrabajoById(id: string): Promise<OrdenTrabajo | null> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  const resource = extractResource(payload) as { id: string; attributes: Record<string, unknown> } | null;
  return resource ? mapOrdenFromApi(resource) : null;
}

export async function createOrdenTrabajo(input: NuevaOrdenTrabajoInput): Promise<OrdenTrabajo | null> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'work_orders',
        attributes: {
          activo_id: input.activo_id,
          tipo: input.tipo,
          ...(input.descripcion_trabajo && { descripcion_trabajo: input.descripcion_trabajo }),
          ...(input.supervisor_id && { supervisor_id: input.supervisor_id }),
          ...(input.reporte_id && { reporte_id: input.reporte_id }),
          ...(input.plan_id && { plan_id: input.plan_id }),
          ...(input.fecha_apertura && { fecha_apertura: input.fecha_apertura }),
          ...(input.costo_estimado !== undefined && { costo_estimado: input.costo_estimado }),
          ...(input.moneda && { moneda: input.moneda }),
        },
      },
    },
  });
  const resource = extractResource(payload) as { id: string; attributes: Record<string, unknown> } | null;
  return resource ? mapOrdenFromApi(resource) : null;
}

export async function updateOrdenTrabajo(id: string, input: ActualizarOrdenTrabajoInput): Promise<OrdenTrabajo | null> {
  const url = await baseUrl();
  const attrs: Record<string, unknown> = { version: input.version };
  if (input.tipo !== undefined) attrs.tipo = input.tipo;
  if (input.descripcion_trabajo !== undefined) attrs.descripcion_trabajo = input.descripcion_trabajo;
  if (input.supervisor_id !== undefined) attrs.supervisor_id = input.supervisor_id;
  if (input.costo_estimado !== undefined) attrs.costo_estimado = input.costo_estimado;
  if (input.costo_real !== undefined) attrs.costo_real = input.costo_real;
  if (input.moneda !== undefined) attrs.moneda = input.moneda;
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'work_orders', attributes: attrs } },
  });
  const resource = extractResource(payload) as { id: string; attributes: Record<string, unknown> } | null;
  return resource ? mapOrdenFromApi(resource) : null;
}

export async function deleteOrdenTrabajo(id: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}

export async function cambiarEstadoOT(id: string, input: CambiarEstadoOTInput): Promise<OrdenTrabajo | null> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}/estado`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'work_orders',
        attributes: {
          estado: input.estado,
          version: input.version,
          ...(input.motivo && { motivo: input.motivo }),
        },
      },
    },
  });
  const resource = extractResource(payload) as { id: string; attributes: Record<string, unknown> } | null;
  return resource ? mapOrdenFromApi(resource) : null;
}

export async function validarOrdenTrabajo(id: string): Promise<OrdenTrabajo | null> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}/validar`, { method: 'POST', contentType: 'json-api', json: {} });
  const resource = extractResource(payload) as { id: string; attributes: Record<string, unknown> } | null;
  return resource ? mapOrdenFromApi(resource) : null;
}

export async function asignarTecnicoOT(id: string, input: AsignarTecnicoInput): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}/asignar-tecnico`, {
    method: 'POST',
    contentType: 'json-api',
    json: { data: { type: 'work_order_technician', attributes: { tecnico_id: input.tecnico_id } } },
  });
}

export async function removerTecnicoOT(id: string, tecnicoId: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}/remover-tecnico?tecnico_id=${tecnicoId}`, { method: 'DELETE' });
}

export async function getHistorialEstadosOT(id: string): Promise<HistorialEstadoOT[]> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}/historial-estados`);
  const resources = extractResourceList(payload) as Array<{ id: string; attributes: Record<string, unknown> }>;
  return resources.map(mapHistorialFromApi);
}

