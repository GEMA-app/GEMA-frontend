import { extractResource, extractResourceList } from '@/lib/jsonapi';
import {
  mapProveedorFromApi,
  mapProveedorDetalleFromApi,
} from '@/lib/proveedores';
import type {
  CreateProveedorForm,
  Proveedor,
  ProveedorDetalle,
  ProveedoresQuery,
  ProveedoresResponse,
  UpdateProveedorForm,
} from '@/types/proveedor';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';

export async function getProveedores(params: ProveedoresQuery = {}): Promise<ProveedoresResponse> {
  const empresaId = await requireEmpresaId();
  const query = params.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/proveedores${query}`,
  );
  return { proveedores: extractResourceList(payload).map(mapProveedorFromApi) };
}

export async function getProveedor(id: string): Promise<ProveedorDetalle> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/proveedores/${id}`,
  );
  const resource = extractResource(payload);
  if (!resource) throw new Error('Proveedor no encontrado');
  return mapProveedorDetalleFromApi(resource);
}

export async function createProveedor(data: CreateProveedorForm): Promise<Proveedor> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/proveedores`, {
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
        },
      },
    },
  });
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar el proveedor creado.');
  return mapProveedorFromApi(resource);
}

export async function updateProveedor(id: string, data: UpdateProveedorForm): Promise<Proveedor> {
  const empresaId = await requireEmpresaId();
  const { version, ...rest } = data;
  const attributes: Record<string, unknown> = { version };
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) attributes[key] = value || null;
  }
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/proveedores/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'suppliers', attributes } },
  });
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar el proveedor actualizado.');
  return mapProveedorFromApi(resource);
}

export async function deleteProveedor(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/proveedores/${id}`, { method: 'DELETE' });
}
