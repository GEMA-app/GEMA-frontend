import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import {
  buildUbicacionTree,
  flattenBackendTree,
  mapApiUbicacionToUi,
} from '@/lib/ubicaciones';
import type { NuevaUbicacionForm, Ubicacion } from '@/types/ubicacion';

export async function getUbicaciones(): Promise<Ubicacion[]> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<Record<string, unknown>>(
    `/v1/empresas/${empresaId}/ubicaciones`,
  );
  const flat = flattenBackendTree(payload);
  const items = flat.map(mapApiUbicacionToUi).filter((i): i is Ubicacion => i !== null);
  return buildUbicacionTree(items);
}

function normalizeTipo(raw: string): string {
  const map: Record<string, string> = {
    sede: 'sede', sede_principal: 'sede', headquarters: 'sede',
    planta: 'planta', plant: 'planta',
    area: 'area', área: 'area',
    seccion: 'seccion', sección: 'seccion', section: 'seccion',
  };
  return map[raw.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || 'area';
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
          tipo: normalizeTipo(data.tipo),
          parent_id: data.parentId || null,
          descripcion: data.jerarquia || null,
        },
      },
    },
  });
}

export async function updateUbicacion(
  id: string,
  data: Partial<NuevaUbicacionForm>,
): Promise<void> {
  const empresaId = await requireEmpresaId();
  const attrs: Record<string, unknown> = {};
  if (data.nombre !== undefined) attrs.nombre = data.nombre;
  if (data.tipo !== undefined) attrs.tipo = normalizeTipo(data.tipo);
  if (data.parentId !== undefined) attrs.parent_id = data.parentId;
  if (data.jerarquia !== undefined) attrs.descripcion = data.jerarquia;

  await fetchWithAuth(`/v1/empresas/${empresaId}/ubicaciones/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'locations', attributes: attrs } },
  });
}

export async function deleteUbicacion(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/ubicaciones/${id}`, {
    method: 'DELETE',
  });
}
