import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResource, extractResourceList } from '@/lib/jsonapi';
import { mapRepuestoUtilizado } from '@/lib/intervenciones';
import type { NuevoRepuestoUtilizadoInput, RepuestoUtilizado } from '@/types/repuesto-utilizado';

async function baseUrl(otId: string, intervencionId: string): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/ordenes-trabajo/${otId}/intervenciones/${intervencionId}/repuestos-utilizados`;
}

export async function getRepuestosUtilizados(otId: string, intervencionId: string): Promise<RepuestoUtilizado[]> {
  const url = await baseUrl(otId, intervencionId);
  const payload = await fetchWithAuth<unknown>(url);
  return extractResourceList(payload).map((r) => mapRepuestoUtilizado({ id: r.id, ...r.attributes }));
}

export async function createRepuestoUtilizado(
  otId: string,
  intervencionId: string,
  input: NuevoRepuestoUtilizadoInput,
): Promise<RepuestoUtilizado> {
  const url = await baseUrl(otId, intervencionId);
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'repuesto-utilizado',
        attributes: {
          intervencion_id: intervencionId,
          repuesto_id: input.repuesto_id,
          cantidad_usada: input.cantidad_usada,
          precio_unitario: input.precio_unitario ?? null,
          moneda: input.moneda ?? 'USD',
        },
      },
    },
  });
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar el repuesto utilizado.');
  return mapRepuestoUtilizado({ id: resource.id, ...resource.attributes });
}

export async function updateRepuestoUtilizado(
  otId: string,
  intervencionId: string,
  id: string,
  cantidadUsada: number,
): Promise<RepuestoUtilizado> {
  const url = await baseUrl(otId, intervencionId);
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'repuesto-utilizado',
        id,
        attributes: { cantidad_usada: cantidadUsada },
      },
    },
  });
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar el repuesto utilizado.');
  return mapRepuestoUtilizado({ id: resource.id, ...resource.attributes });
}

export async function deleteRepuestoUtilizado(otId: string, intervencionId: string, id: string): Promise<void> {
  const url = await baseUrl(otId, intervencionId);
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}