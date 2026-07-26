import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { buildOffsetQuery } from '@/lib/pagination';
import {
  extractIntervencionesFromResponse,
  extractIntervencionesMeta,
  mapIntervencionFromResponse,
} from '@/lib/intervenciones';
import type {
  ActualizarIntervencionInput,
  Intervencion,
  IntervencionesResponse,
  NuevaIntervencionInput,
} from '@/types/intervencion';

async function baseUrl(otId: string): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/ordenes-trabajo/${otId}/intervenciones`;
}

export async function getIntervenciones(otId: string, page = 1, perPage = 20): Promise<IntervencionesResponse> {
  const url = await baseUrl(otId);
  const payload = await fetchWithAuth<unknown>(`${url}${buildOffsetQuery({ page, perPage })}`);
  return {
    intervenciones: extractIntervencionesFromResponse(payload),
    meta: extractIntervencionesMeta(payload, page, perPage),
  };
}

export async function createIntervencion(otId: string, input: NuevaIntervencionInput): Promise<Intervencion> {
  const url = await baseUrl(otId);
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'intervenciones',
        attributes: {
          work_order_id: otId,
          technician_id: input.technician_id,
          tareas_realizadas: input.tareas_realizadas,
          fecha_inicio: input.fecha_inicio,
          horas_hombre: input.horas_hombre,
          fecha_fin: input.fecha_fin ?? null,
        },
      },
    },
  });
  const intervencion = mapIntervencionFromResponse(payload);
  if (!intervencion) throw new Error('No se pudo interpretar la intervencion creada.');
  return intervencion;
}

export async function updateIntervencion(
  otId: string,
  id: string,
  input: ActualizarIntervencionInput,
): Promise<Intervencion> {
  const url = await baseUrl(otId);
  const attributes: Record<string, unknown> = {};
  if (input.tareas_realizadas !== undefined) attributes.tareas_realizadas = input.tareas_realizadas;
  if (input.horas_hombre !== undefined) attributes.horas_hombre = input.horas_hombre;
  if (input.fecha_fin !== undefined) attributes.fecha_fin = input.fecha_fin;
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'intervenciones', id, attributes } },
  });
  const intervencion = mapIntervencionFromResponse(payload);
  if (!intervencion) throw new Error('No se pudo interpretar la intervencion actualizada.');
  return intervencion;
}

export async function deleteIntervencion(otId: string, id: string): Promise<void> {
  const url = await baseUrl(otId);
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}