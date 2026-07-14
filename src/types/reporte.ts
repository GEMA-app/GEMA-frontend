export type ReporteTipo = 'correctivo' | 'preventivo';
export type ReportePrioridad = 'alta' | 'media' | 'baja';
export type ReporteEstado = 'completado' | 'en_proceso' | 'programado';

export interface Reporte {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  tipo: ReporteTipo;
  prioridad: ReportePrioridad;
  estado: ReporteEstado;
  asignado: string;
}

export type ReporteFiltroTipo = 'todos' | ReporteTipo;

export interface ReportesResumen {
  alertasCriticas: number;
  enProceso: number;
  completados: number;
}

export interface ReportesMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface ReportesQuery {
  page?: number;
  perPage?: number;
  search?: string;
  tipo?: ReporteFiltroTipo;
  estado?: ReporteEstado;
}

export interface ReportesResponse {
  reportes: Reporte[];
  meta: ReportesMeta;
}

export interface NuevoReporteInput {
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  tipo: ReporteTipo;
  prioridad: ReportePrioridad;
  asignado: string;
}

export interface ActualizarReporteInput {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
  prioridad?: ReportePrioridad;
  estado?: ReporteEstado;
  version: number;
}
