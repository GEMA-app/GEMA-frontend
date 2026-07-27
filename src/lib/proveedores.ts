import { extractResourceList, type JsonApiResource } from '@/lib/jsonapi';
import type { Proveedor } from '@/types/proveedor';

export function mapProveedorFromApi(resource: JsonApiResource): Proveedor {
  const a = resource.attributes;
  const is_active = a.is_active !== undefined ? Boolean(a.is_active) : a.estado !== 'inactivo';
  const estado: 'activo' | 'inactivo' = (a.estado as 'activo' | 'inactivo') || (is_active ? 'activo' : 'inactivo');

  return {
    id: resource.id,
    name: (a.name as string) || 'Sin nombre',
    rif: (a.rif as string) || null,
    phone: (a.phone as string) || null,
    email: (a.email as string) || null,
    contact: (a.contact as string) || null,
    address: (a.address as string) || (a.direccion as string) || null,
    is_active,
    estado,
    version: (a.version as number) || 1,
  };
}

export function extractProveedoresFromResponse(payload: unknown): Proveedor[] {
  return extractResourceList(payload).map(mapProveedorFromApi);
}