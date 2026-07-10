import { fetchWithAuth } from '@/lib/api';
import {
  buildUbicacionTree,
  extractUbicacionesFromResponse,
  mapUiUbicacionToApiPayload,
} from '@/lib/ubicaciones';
import type { NuevaUbicacionForm, Ubicacion } from '@/types/ubicacion';

function mapFormToGimaPayload(data: NuevaUbicacionForm) {
  const mapped = mapUiUbicacionToApiPayload(data);
  return {
    edificio: mapped.jerarquia as string,
    piso: mapped.tipo as string,
    salon: mapped.nombre as string,
  };
}

export async function getUbicaciones(): Promise<Ubicacion[]> {
  const payload = await fetchWithAuth<unknown>('/admin/ubicaciones');
  const flatList = extractUbicacionesFromResponse(payload);
  return buildUbicacionTree(flatList);
}

export async function createUbicacion(data: NuevaUbicacionForm): Promise<void> {
  await fetchWithAuth('/admin/ubicaciones', {
    method: 'POST',
    json: mapFormToGimaPayload(data),
  });
}

export async function updateUbicacion(
  id: string,
  data: Partial<NuevaUbicacionForm>,
): Promise<void> {
  const payload: Record<string, string> = {};

  if (data.nombre !== undefined) payload.salon = data.nombre;
  if (data.jerarquia !== undefined) payload.edificio = data.jerarquia;
  if (data.tipo !== undefined) payload.piso = data.tipo;

  await fetchWithAuth(`/admin/ubicaciones/${id}`, {
    method: 'PUT',
    json: payload,
  });
}

export async function deleteUbicacion(id: string): Promise<void> {
  await fetchWithAuth(`/admin/ubicaciones/${id}`, {
    method: 'DELETE',
  });
}
