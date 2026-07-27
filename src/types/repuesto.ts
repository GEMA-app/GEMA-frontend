import type { PaginationMeta } from '@/types/common';

export interface Repuesto {
  id: string;
  articulo_id: string;
  proveedor_id: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion_almacen: string;
  precio_unitario: number;
  moneda: string;
  version: number;
}

export type TipoMovimiento = 'entrada' | 'salida';

export interface MovimientoInventario {
  id: string;
  repuesto_id: string;
  movement_type: TipoMovimiento;
  quantity: number;
  work_order_id: string | null;
  usuario_id: string | null;
  precio_unitario: number | null;
  moneda: string;
  fecha_movimiento: string | null;
  reason: string | null;
}

export interface MovimientosResponse {
  movimientos: MovimientoInventario[];
  meta: PaginationMeta;
}

export interface RepuestosQuery {
  page?: number;
  perPage?: number;
}

export interface RepuestosResponse {
  repuestos: Repuesto[];
  meta: PaginationMeta;
}

export interface NuevoRepuestoInput {
  articulo_id: string;
  proveedor_id?: string;
  ubicacion_almacen: string;
  stock_actual?: number;
  stock_minimo?: number;
  precio_unitario?: number;
  moneda?: string;
}

export interface ActualizarRepuestoInput {
  proveedor_id?: string;
  stock_minimo?: number;
  ubicacion_almacen?: string;
  precio_unitario?: number;
  moneda?: string;
  version: number;
}

export interface NuevoMovimientoInput {
  movement_type: TipoMovimiento;
  quantity: number;
  work_order_id?: string;
  reason?: string;
}