import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResource, extractResourceList } from '@/lib/jsonapi';
import type { JsonApiResource } from '@/lib/jsonapi';
import type { NuevaUbicacionForm, TipoUbicacion, Ubicacion } from '@/types/ubicacion';

function mapTreeResource(resource: JsonApiResource): Ubicacion {
  const attrs = resource.attributes;
  const children = Array.isArray(attrs.children)
    ? attrs.children.map((child: unknown) => mapTreeResource(child as JsonApiResource))
    : undefined;
  return {
    id: resource.id,
    nombre: (attrs.nombre as string) || '',
    tipo: (attrs.tipo as TipoUbicacion) || 'area',
    descripcion: (attrs.descripcion as string) || null,
    parentId: (attrs.parent_id as string) || null,
    hijos: children,
  };
}

export async function getUbicaciones(): Promise<Ubicacion[]> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/ubicaciones`,
  );
  const resources = extractResourceList(payload);
  return resources.map(mapTreeResource);
}

export async function getUbicacion(id: string): Promise<Ubicacion> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/ubicaciones/${id}`,
  );
  const resource = extractResource(payload);
  if (!resource) throw new Error('Ubicación no encontrada');
  const attrs = resource.attributes;
  return {
    id: resource.id,
    nombre: (attrs.nombre as string) || '',
    tipo: (attrs.tipo as TipoUbicacion) || 'area',
    descripcion: (attrs.descripcion as string) || null,
    parentId: (attrs.parent_id as string) || null,
  };
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

export async function updateUbicacion(id: string, data: Partial<NuevaUbicacionForm>): Promise<void> {
  const empresaId = await requireEmpresaId();
  const attrs: Record<string, unknown> = {};
  if (data.nombre !== undefined) attrs.nombre = data.nombre;
  if (data.tipo !== undefined) attrs.tipo = data.tipo;
  if (data.parentId !== undefined) attrs.parent_id = data.parentId || null;
  if (data.descripcion !== undefined) attrs.descripcion = data.descripcion || null;

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

export async function getUbicacionChildren(id: string): Promise<Ubicacion[]> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/ubicaciones/${id}/hijos`,
  );
  const resources = extractResourceList(payload);
  return resources.map((r) => {
    const attrs = r.attributes;
    return {
      id: r.id,
      nombre: (attrs.nombre as string) || '',
      tipo: (attrs.tipo as TipoUbicacion) || 'area',
      descripcion: (attrs.descripcion as string) || null,
      parentId: (attrs.parent_id as string) || null,
    };
  });
}
