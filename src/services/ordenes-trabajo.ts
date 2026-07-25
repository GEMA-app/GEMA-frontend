import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { buildOffsetQuery } from '@/lib/pagination';
import { extractOrdenesFromResponse, extractOrdenesMeta, mapOrdenFromResource } from '@/lib/orden-trabajo';
import type { OrdenTrabajo, OrdenesQuery, NuevaOrdenInput, ActualizarOrdenInput, CambioEstadoInput, HistorialEstado } from '@/types/orden-trabajo';

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/ordenes-trabajo`;
}

export async function getOrdenes(params: OrdenesQuery = {}): Promise<{ ordenes: OrdenTrabajo[]; meta: ReturnType<typeof extractOrdenesMeta> }> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}${buildOffsetQuery(params as Record<string, string | number | undefined>)}`);
  return {
    ordenes: extractOrdenesFromResponse(payload),
    meta: extractOrdenesMeta(payload, params.page ?? 1, params.perPage ?? 15),
  };
}

export async function getOrdenById(id: string): Promise<OrdenTrabajo> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  const orden = mapOrdenFromResource(payload);
  if (!orden) throw new Error('No se pudo interpretar la orden de trabajo.');
  return orden;
}

export async function createOrden(input: NuevaOrdenInput): Promise<OrdenTrabajo> {
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
          codigo_ot: input.codigo_ot,
          supervisor_id: input.supervisor_id,
          descripcion_trabajo: input.descripcion_trabajo,
          costo_estimado: input.costo_estimado,
          moneda: input.moneda ?? 'USD',
        },
      },
    },
  });
  const orden = mapOrdenFromResource(payload);
  if (!orden) throw new Error('No se pudo interpretar la respuesta.');
  return orden;
}

export async function updateOrden(id: string, input: ActualizarOrdenInput): Promise<OrdenTrabajo> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'work_orders',
        attributes: {
          descripcion_trabajo: input.descripcion_trabajo,
          costo_estimado: input.costo_estimado,
          costo_real: input.costo_real,
          supervisor_id: input.supervisor_id,
        },
      },
    },
  });
  const orden = mapOrdenFromResource(payload);
  if (!orden) throw new Error('No se pudo interpretar la respuesta.');
  return orden;
}

export async function deleteOrden(id: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}

export async function cambiarEstadoOrden(id: string, input: CambioEstadoInput): Promise<OrdenTrabajo> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}/estado`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'work_orders',
        attributes: {
          estado: input.estado,
          motivo: input.motivo ?? null,
        },
      },
    },
  });
  const orden = mapOrdenFromResource(payload);
  if (!orden) throw new Error('No se pudo interpretar la respuesta.');
  return orden;
}

export async function asignarTecnico(ordenId: string, tecnicoId: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${ordenId}/asignar-tecnico`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'work_order_technician',
        attributes: { tecnico_id: tecnicoId },
      },
    },
  });
}

export async function removerTecnico(ordenId: string, tecnicoId: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${ordenId}/remover-tecnico?tecnico_id=${tecnicoId}`, {
    method: 'DELETE',
  });
}

export async function validarOrden(ordenId: string): Promise<OrdenTrabajo> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${ordenId}/validar`, {
    method: 'POST',
    contentType: 'json-api',
    json: {},
  });
  const orden = mapOrdenFromResource(payload);
  if (!orden) throw new Error('No se pudo interpretar la respuesta.');
  return orden;
}

export async function getHistorialEstados(ordenId: string): Promise<HistorialEstado[]> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${ordenId}/historial-estados`);
  const data = (payload as Record<string, unknown>)?.data;
  if (!Array.isArray(data)) return [];
  return data.map((item: Record<string, unknown>) => {
    const attrs = item.attributes as Record<string, unknown> | undefined;
    return {
      id: String(item.id ?? ''),
      ordenes_trabajo_id: String(attrs?.ordenes_trabajo_id ?? ''),
      estado_anterior: (attrs?.estado_anterior as string) ?? null,
      estado_nuevo: String(attrs?.estado_nuevo ?? ''),
      usuario_id: (attrs?.usuario_id as string) ?? null,
      motivo: (attrs?.motivo as string) ?? null,
      fecha_cambio: String(attrs?.fecha_cambio ?? ''),
    };
  });
}
