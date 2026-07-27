import type { PaginationMeta } from '@/types/common';

export type ReportePrioridad = 'critica' | 'alta' | 'media' | 'baja';
export type ReporteEstado = 'pendiente' | 'en_proceso' | 'atendido' | 'resuelto' | 'descartado' | 'cancelado';

export interface Reporte {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: ReportePrioridad;
  reported_by: string;
  status: ReporteEstado;
  activo_id: string | null;
  orden_trabajo_id: string | null;
  created_at: string;
  version: number;
  codigo?: string;
  observaciones?: string | null;
  tecnico?: string;
}

export interface ReportesQuery {
  page?: number;
  perPage?: number;
  status?: ReporteEstado;
  priority?: ReportePrioridad;
  search?: string;
}

export interface ReportesResponse {
  reportes: Reporte[];
  meta: PaginationMeta;
}

export interface NuevoReporteInput {
  title?: string;
  description: string;
  location?: string;
  priority: ReportePrioridad;
  reported_by?: string;
  activo_id?: string;
  observaciones?: string;
}

export interface ActualizarReporteInput {
  title?: string;
  description?: string;
  location?: string;
  priority?: ReportePrioridad;
  reported_by?: string;
  status?: ReporteEstado;
  activo_id?: string;
  observaciones?: string;
  version: number;
}

export const TRANSICIONES_REPORTE: Record<ReporteEstado, ReporteEstado[]> = {
  pendiente: ['en_proceso', 'descartado', 'cancelado', 'atendido', 'resuelto'],
  en_proceso: ['atendido', 'resuelto', 'descartado', 'cancelado'],
  atendido: [],
  resuelto: [],
  descartado: [],
  cancelado: [],
};