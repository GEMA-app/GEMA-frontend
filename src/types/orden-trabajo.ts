import type { PaginationMeta } from '@/types/common';

export type TipoMantenimientoOT = 'preventivo' | 'correctivo' | 'predictivo';
export type EstadoOrdenTrabajo = 'abierta' | 'en_proceso' | 'pausada' | 'cerrada' | 'cancelada';
export type EstadoOT = EstadoOrdenTrabajo;

export interface OrdenTrabajo {
  id: string;
  codigo_ot: string;
  activo_id: string;
  tipo: TipoMantenimientoOT;
  estado: EstadoOrdenTrabajo;
  descripcion_trabajo: string | null;
  supervisor_id: string | null;
  reporte_id: string | null;
  plan_id: string | null;
  fecha_apertura: string;
  fecha_cierre: string | null;
  fecha_inicio_trabajo: string | null;
  costo_estimado: number | null;
  costo_real: number | null;
  moneda: string;
  validado_por_id: string | null;
  fecha_validacion: string | null;
  version: number;
}

export interface HistorialEstadoOT {
  id: string;
  orden_trabajo_id: string;
  estado_anterior: EstadoOrdenTrabajo | null;
  estado_nuevo: EstadoOrdenTrabajo;
  motivo: string | null;
  fecha_cambio: string;
  usuario_id: string | null;
}

export interface NuevaOrdenTrabajoInput {
  activo_id: string;
  tipo: TipoMantenimientoOT;
  descripcion_trabajo?: string | null;
  supervisor_id?: string;
  reporte_id?: string;
  plan_id?: string;
  fecha_apertura?: string;
  costo_estimado?: number;
  moneda?: string;
}

export interface ActualizarOrdenTrabajoInput {
  tipo?: TipoMantenimientoOT;
  descripcion_trabajo?: string | null;
  supervisor_id?: string | null;
  costo_estimado?: number | null;
  costo_real?: number | null;
  moneda?: string;
  version?: number;
}

export interface CambiarEstadoOTInput {
  estado: EstadoOrdenTrabajo;
  motivo?: string;
  version?: number;
}

export interface AsignarTecnicoInput {
  tecnico_id: string;
}

export interface OrdenTrabajoQuery {
  page?: number;
  perPage?: number;
  estado?: EstadoOrdenTrabajo;
  tipo?: TipoMantenimientoOT;
  activo_id?: string;
  supervisor_id?: string;
  search?: string;
}

export interface OrdenesTrabajoResponse {
  ordenes: OrdenTrabajo[];
  meta: PaginationMeta;
}