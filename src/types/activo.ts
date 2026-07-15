import type { PaginationMeta } from '@/types/common';

// ── Estados (alineados con AssetStatus del backend) ──
export type ActivoEstado =
  | 'operativo'
  | 'en_mantenimiento'
  | 'fuera_de_servicio'
  | 'dado_de_baja';

// ── Interfaces de UI ──
export interface Activo {
  id: string;
  nombre: string;
  serial: string;
  ubicacion: string;
  estado: ActivoEstado;
}

export interface ActivoDetalle extends Activo {
  ubicacionId: string | null;
  codigoActivo: string;
  articuloId: string;
  fechaAdquisicion: string | null;
  valorMonetario: number | null;
  moneda: string;
  version: number;
}

// ── Query y Meta ──
export interface ActivosQuery {
  page?: number;
  perPage?: number;
  search?: string;
  estado?: ActivoEstado;
  ubicacionId?: string;
}

export interface ActivosResponse {
  activos: Activo[];
  meta: PaginationMeta;
}

// ── Inputs ──
export interface NuevoActivoInput {
  nombre: string;
  codigo: string;
  marca: string;
  ubicacion: string;
  fechaCompra: string;
  valorMonetario: string;
  moneda: string;
  estadoInicial: ActivoEstado | string;
}

export interface ActualizarActivoInput {
  nombre?: string;
  codigo?: string;
  ubicacion?: string;
  fechaCompra?: string;
  estadoInicial?: ActivoEstado | string;
  version: number;
}
