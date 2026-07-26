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
  empresaId: string;
  articuloId: string;
  serialInterno: string;
  codigoActivo: string;
  ubicacion: string;
  ubicacionId: string | null;
  estado: ActivoEstado;
  // Aliases de compatibilidad semántica para UI
  nombre: string; // Mapa a serialInterno
  serial: string; // Mapa a codigoActivo
}

export interface ActivoDetalle extends Activo {
  fechaAdquisicion: string | null;
  valorMonetario: number | null;
  moneda: string;
  version: number;
}

// ── Response Schemas backend API ──
export interface ActivoResponse {
  id: string;
  empresa_id: string;
  articulo_id: string;
  serial_interno: string;
  codigo_activo: string;
  estado: ActivoEstado;
  ubicacion_id: string | null;
  fecha_adquisicion: string | null;
  valor_monetario: number | null;
  moneda: string;
  version: number;
}

export interface CatalogArticleResponse {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
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

// ── Form Inputs ──
export interface CreateActivoForm {
  nombre: string;
  codigo: string;
  marca?: string;
  ubicacion?: string;
  fechaCompra?: string;
  valorMonetario?: string;
  moneda?: string;
  estadoInicial: ActivoEstado | string;
}

export interface NuevoActivoInput {
  serialInterno: string;
  codigoActivo: string;
  articuloId?: string;
  ubicacionId?: string;
  fechaAdquisicion?: string;
  valorMonetario?: number;
  moneda?: string;
  estado: ActivoEstado;
}

export interface ActualizarActivoInput {
  serialInterno?: string;
  codigoActivo?: string;
  ubicacionId?: string;
  fechaAdquisicion?: string;
  valorMonetario?: number;
  moneda?: string;
  estado?: ActivoEstado;
  version: number;
}

export interface LogEstadoActivo {
  id: string;
  activo_id: string;
  estado_anterior: ActivoEstado | null;
  estado_nuevo: ActivoEstado;
  motivo: string | null;
  fecha_cambio: string;
  usuario_id: string | null;
}
