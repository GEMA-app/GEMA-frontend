import { extractResource, extractResourceList, getAttr, getAttrNumber, type JsonApiResource } from '@/lib/jsonapi';
import { extractMetaFromResponse } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/common';
import type { MovimientoInventario, Repuesto, TipoMovimiento } from '@/types/repuesto';

export function mapRepuestoFromApi(resource: JsonApiResource): Repuesto {
  return {
    id: resource.id,
    articulo_id: getAttr(resource, 'articulo_id'),
    proveedor_id: getAttr(resource, 'proveedor_id'),
    stock_actual: getAttrNumber(resource, 'stock_actual'),
    stock_minimo: getAttrNumber(resource, 'stock_minimo'),
    ubicacion_almacen: getAttr(resource, 'ubicacion_almacen'),
    precio_unitario: getAttrNumber(resource, 'precio_unitario'),
    moneda: getAttr(resource, 'moneda', 'USD'),
    version: getAttrNumber(resource, 'version', 1),
  };
}

export function mapRepuestoFromResponse(payload: unknown): Repuesto | null {
  const resource = extractResource(payload);
  return resource ? mapRepuestoFromApi(resource) : null;
}

export function extractRepuestosFromResponse(payload: unknown): Repuesto[] {
  return extractResourceList(payload).map(mapRepuestoFromApi);
}

export function extractRepuestosMeta(payload: unknown, page = 1, perPage = 15): PaginationMeta {
  return extractMetaFromResponse(payload, page, perPage);
}

export function mapMovimientoFromApi(resource: JsonApiResource): MovimientoInventario {
  return {
    id: resource.id,
    repuesto_id: getAttr(resource, 'repuesto_id'),
    movement_type: (getAttr(resource, 'movement_type') ?? 'entrada') as TipoMovimiento,
    quantity: getAttrNumber(resource, 'quantity'),
    work_order_id: getAttr(resource, 'work_order_id') ?? null,
    usuario_id: getAttr(resource, 'usuario_id') ?? null,
    precio_unitario: resource.attributes.precio_unitario != null
      ? getAttrNumber(resource, 'precio_unitario')
      : null,
    moneda: getAttr(resource, 'moneda', 'USD'),
    fecha_movimiento: getAttr(resource, 'fecha_movimiento') ?? null,
    reason: getAttr(resource, 'reason') ?? null,
  };
}

export function extractMovimientosFromResponse(payload: unknown): MovimientoInventario[] {
  return extractResourceList(payload).map(mapMovimientoFromApi);
}

export function extractMovimientosMeta(payload: unknown, page = 1, perPage = 20): PaginationMeta {
  return extractMetaFromResponse(payload, page, perPage);
}