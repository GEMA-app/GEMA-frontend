import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResource, extractResourceList } from '@/lib/jsonapi';
import { mapTreeResource, mapUbicacionFromApi } from '@/lib/ubicaciones';
import type { ActualizarUbicacionForm, NuevaUbicacionForm, Ubicacion } from '@/types/ubicacion';

export async function getUbicaciones(): Promise<Ubicacion[]> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/ubicaciones`);
  const resources = extractResourceList(payload);
  return resources.map(mapTreeResource);
}

export async function getUbicacion(id: string): Promise<Ubicacion> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/ubicaciones/${id}`);
  const resource = extractResource(payload);
  if (!resource) throw new Error('Ubicación no encontrada');
  return mapUbicacionFromApi(resource);
}

export async function createUbicacion(data: NuevaUbicacionForm): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/ubicaciones`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'locations',
        attributes: {
          nombre: data.nombre,
          tipo: data.tipo,
          parent_id: data.parentId || null,
          descripcion: data.descripcion || null,
        },
      },
    },
  });
}

export async function updateUbicacion(id: string, data: Partial<ActualizarUbicacionForm>): Promise<void> {
  const empresaId = await requireEmpresaId();
  const attrs: Record<string, unknown> = {};
  if (data.nombre !== undefined) attrs.nombre = data.nombre;
  if (data.tipo !== undefined) attrs.tipo = data.tipo;
  if (data.parentId !== undefined) attrs.parent_id = data.parentId || null;
  if (data.descripcion !== undefined) attrs.descripcion = data.descripcion || null;
  if (data.version !== undefined) attrs.version = data.version;
  await fetchWithAuth(`/v1/empresas/${empresaId}/ubicaciones/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'locations', attributes: attrs } },
  });
}

export async function deleteUbicacion(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/ubicaciones/${id}`, { method: 'DELETE' });
}

export async function getUbicacionChildren(id: string): Promise<Ubicacion[]> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/ubicaciones/${id}/hijos`);
  const resources = extractResourceList(payload);
  return resources.map(mapUbicacionFromApi);
}

