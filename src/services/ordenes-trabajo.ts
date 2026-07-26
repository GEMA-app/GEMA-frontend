import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResourceList, extractResource } from '@/lib/jsonapi';
import { buildOffsetQuery } from '@/lib/pagination';
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

function mapOrdenFromApi(resource: { id: string; attributes: Record<string, unknown> }): OrdenTrabajo {
  const a = resource.attributes;
  return {
    id: resource.id,
    codigo_ot: (a.codigo_ot as string) ?? '',
    activo_id: (a.activo_id as string) ?? '',
    tipo: (a.tipo as OrdenTrabajo['tipo']) ?? 'correctivo',
    estado: (a.estado as OrdenTrabajo['estado']) ?? 'abierta',
    descripcion_trabajo: (a.descripcion_trabajo as string) ?? '',
    supervisor_id: (a.supervisor_id as string | null) ?? null,
    reporte_id: (a.reporte_id as string | null) ?? null,
    plan_id: (a.plan_id as string | null) ?? null,
    fecha_apertura: (a.fecha_apertura as string) ?? '',
    fecha_cierre: (a.fecha_cierre as string | null) ?? null,
    fecha_inicio_trabajo: (a.fecha_inicio_trabajo as string | null) ?? null,
    costo_estimado: (a.costo_estimado as number | null) ?? null,
    costo_real: (a.costo_real as number | null) ?? null,
    moneda: (a.moneda as string) ?? 'VES',
    validado_por_id: (a.validado_por_id as string | null) ?? null,
    fecha_validacion: (a.fecha_validacion as string | null) ?? null,
    version: (a.version as number) ?? 1,
  };
}

function mapHistorialFromApi(resource: { id: string; attributes: Record<string, unknown> }): HistorialEstadoOT {
  const a = resource.attributes;
  return {
    id: resource.id,
    orden_trabajo_id: (a.orden_trabajo_id as string) ?? '',
    estado_anterior: (a.estado_anterior as HistorialEstadoOT['estado_anterior']) ?? null,
    estado_nuevo: (a.estado_nuevo as HistorialEstadoOT['estado_nuevo']) ?? 'abierta',
    motivo: (a.motivo as string | null) ?? null,
    fecha_cambio: (a.fecha_cambio as string) ?? '',
    usuario_id: (a.usuario_id as string | null) ?? null,
  };
}

export async function getOrdenesTrabajo(params: OrdenTrabajoQuery = {}): Promise<OrdenesTrabajoResponse> {
  const url = await baseUrl();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const query = buildOffsetQuery({ page, perPage });
  const payload = await fetchWithAuth<unknown>(url + query);
  const resources = extractResourceList(payload) as Array<{ id: string; attributes: Record<string, unknown> }>;
  const meta = (payload as { meta?: { total?: number; page?: number; per_page?: number } })?.meta;
  return {
    ordenes: resources.map(mapOrdenFromApi),
    meta: {
      total: meta?.total ?? 0,
      page: meta?.page ?? page,
      perPage: meta?.per_page ?? perPage,
      lastPage: meta?.total ? Math.ceil(meta.total / perPage) : 1,
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
          descripcion_trabajo: input.descripcion_trabajo,
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
    json: { data: { type: 'work_orders', attributes: { usuario_id: input.usuario_id } } },
  });
}

export async function removerTecnicoOT(id: string, usuarioId: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}/remover-tecnico?usuario_id=${usuarioId}`, { method: 'DELETE' });
}

export async function getHistorialEstadosOT(id: string): Promise<HistorialEstadoOT[]> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}/historial-estados`);
  const resources = extractResourceList(payload) as Array<{ id: string; attributes: Record<string, unknown> }>;
  return resources.map(mapHistorialFromApi);
}
