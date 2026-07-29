import { extractResourceList, type JsonApiResource } from '@/lib/jsonapi';
import type { Proveedor } from '@/types/proveedor';

export function mapProveedorFromApi(resource: JsonApiResource): Proveedor {
  const a = resource.attributes;
  return {
    id: resource.id,
    name: (a.name as string) || 'Sin nombre',
    rif: (a.rif as string) || null,
    phone: (a.phone as string) || null,
    email: (a.email as string) || null,
    contact: (a.contact as string) || null,
    activo: (a.activo as boolean) ?? true,
    direccion: (a.direccion as string) || null,
    version: (a.version as number) || 1,
  };
}

export function extractProveedoresFromResponse(payload: unknown): Proveedor[] {
  return extractResourceList(payload).map(mapProveedorFromApi);
}
