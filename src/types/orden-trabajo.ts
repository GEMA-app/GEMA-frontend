export type EstadoOT = 'abierta' | 'en_proceso' | 'pausada' | 'cerrada' | 'cancelada';
export type TipoMantenimiento = 'preventivo' | 'correctivo' | 'predictivo';

export interface OrdenTrabajo {
  id: string;
  company_id: string;
  codigo_ot: string;
  activo_id: string;
  tipo: TipoMantenimiento;
  estado: EstadoOT;
  reporte_id: string | null;
  supervisor_id: string | null;
  fecha_apertura: string | null;
  fecha_inicio_trabajo: string | null;
  fecha_cierre: string | null;
  descripcion_trabajo: string | null;
  costo_estimado: number | null;
  costo_real: number | null;
  moneda: string;
  validado_por_id: string | null;
  fecha_validacion: string | null;
  version: number;
}

export interface OrdenesQuery {
  page?: number;
  perPage?: number;
  estado?: EstadoOT;
  activo_id?: string;
  tipo?: TipoMantenimiento;
  supervisor_id?: string;
  search?: string;
}

export interface OrdenesMeta {
  total: number;
  offset: number;
  limit: number;
  lastPage: number;
  page: number;
  hasMore: boolean;
}

export interface NuevaOrdenInput {
  activo_id: string;
  tipo: TipoMantenimiento;
  codigo_ot?: string;
  supervisor_id?: string;
  descripcion_trabajo?: string;
  costo_estimado?: number;
  moneda?: string;
}

export interface ActualizarOrdenInput {
  descripcion_trabajo?: string;
  costo_estimado?: number;
  costo_real?: number;
  supervisor_id?: string;
}

export interface CambioEstadoInput {
  estado: EstadoOT;
  motivo?: string;
}

export interface HistorialEstado {
  id: string;
  ordenes_trabajo_id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_id: string | null;
  motivo: string | null;
  fecha_cambio: string;
}
