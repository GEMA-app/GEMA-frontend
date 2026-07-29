import { extractProveedoresFromResponse, mapProveedorFromApi } from '@/lib/proveedores';
import type {
  CreateProveedorForm,
  ProveedorDetalle,
  ProveedoresQuery,
  ProveedoresResponse,
  UpdateProveedorForm,
} from '@/types/proveedor';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';

export async function getProveedores(params: ProveedoresQuery = {}): Promise<ProveedoresResponse> {
  const empresaId = await requireEmpresaId();
  const queryParts: string[] = [];
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/proveedores${query}`,
  );
  return { proveedores: extractProveedoresFromResponse(payload) };
}

export async function getProveedor(id: string): Promise<ProveedorDetalle> {
  const empresaId = await requireEmpresaId();
  const res = await fetchWithAuth<{ data: { id: string; attributes: Record<string, unknown> } }>(
    `/v1/empresas/${empresaId}/proveedores/${id}`,
  );
  const mapped = mapProveedorFromApi(res.data as unknown as Parameters<typeof mapProveedorFromApi>[0]);
    const a = res.data.attributes;

  return {
    ...mapped,
    activo: (a.activo as boolean) ?? true,
    direccion: (a.direccion as string) || null,
    empresa_id: (a.empresa_id as string) || empresaId,
    created_at: (a.created_at as string) || null,
    updated_at: (a.updated_at as string) || null,
  };
}

export async function createProveedor(data: CreateProveedorForm): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/proveedores`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'suppliers',
        attributes: {
          name: data.name,
          rif: data.rif || null,
          phone: data.phone || null,
          email: data.email || null,
          contact: data.contact || null,
          direccion: data.direccion || null,
        },
      },
    },
  });
}

export async function updateProveedor(id: string, data: UpdateProveedorForm): Promise<void> {
  const empresaId = await requireEmpresaId();
  const attrs: Record<string, unknown> = { version: data.version };
  if (data.name !== undefined) attrs.name = data.name;
  if (data.rif !== undefined) attrs.rif = data.rif || null;
  if (data.phone !== undefined) attrs.phone = data.phone || null;
  if (data.email !== undefined) attrs.email = data.email || null;
  if (data.contact !== undefined) attrs.contact = data.contact || null;
  if (data.activo !== undefined) attrs.activo = data.activo;
  if (data.direccion !== undefined) attrs.direccion = data.direccion || null;

  await fetchWithAuth(`/v1/empresas/${empresaId}/proveedores/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'suppliers', attributes: attrs } },
  });
}

export async function deleteProveedor(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/proveedores/${id}`, {
    method: 'DELETE',
  });
}
