import { extractResourceList, getAttr, getAttrNumber, type JsonApiResource } from '@/lib/jsonapi';
import type { Proveedor, ProveedorDetalle } from '@/types/proveedor';

export function mapProveedorFromApi(resource: JsonApiResource): Proveedor {
  return {
    id: resource.id,
    name: getAttr(resource, 'name') || 'Sin nombre',
    rif: getAttr(resource, 'rif') || null,
    phone: getAttr(resource, 'phone') || null,
    email: getAttr(resource, 'email') || null,
    contact: getAttr(resource, 'contact') || null,
    version: getAttrNumber(resource, 'version', 1),
  };
}

export function mapProveedorDetalleFromApi(resource: JsonApiResource): ProveedorDetalle {
  return {
    ...mapProveedorFromApi(resource),
    empresa_id: getAttr(resource, 'empresa_id'),
    created_at: getAttr(resource, 'created_at') || null,
    updated_at: getAttr(resource, 'updated_at') || null,
  };
}

export function extractProveedoresFromResponse(payload: unknown): Proveedor[] {
  return extractResourceList(payload).map(mapProveedorFromApi);
}
