import type { PaginationMeta } from '@/types/common';

export type ActivoEstado =
  | 'operativo'
  | 'en_mantenimiento'
  | 'fuera_de_servicio'
  | 'dado_de_baja';

export interface Activo {
  id: string;
  nombre: string;
  serial: string;
  ubicacion: string;
  estado: ActivoEstado;
}

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

export interface CreateActivoForm {
  nombre: string;
  codigo: string;
  marca: string;
  ubicacion: string;
  fechaCompra: string;
  valorMonetario: string;
  moneda: string;
  estadoInicial: string;
}

export interface ActivoResponse {
  id: string;
  serial_interno: string;
  codigo_activo: string;
  estado: string;
  ubicacion_id: string | null;
  fecha_adquisicion: string | null;
  valor_monetario: number | null;
  moneda: string;
  articulo_id: string;
  version: number;
}

export interface CatalogArticleResponse {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
}
