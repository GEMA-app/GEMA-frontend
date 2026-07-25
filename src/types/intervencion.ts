import type { PaginationMeta } from '@/types/common';
import type { RepuestoUtilizado } from '@/types/repuesto-utilizado';

export interface Intervencion {
  id: string;
  work_order_id: string;
  technician_id: string;
  tareas_realizadas: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  horas_hombre: number;
  used_parts: RepuestoUtilizado[];
}

export interface IntervencionesResponse {
  intervenciones: Intervencion[];
  meta: PaginationMeta;
}

export interface NuevaIntervencionInput {
  technician_id: string;
  tareas_realizadas: string;
  fecha_inicio: string;
  horas_hombre: number;
  fecha_fin?: string;
}

export interface ActualizarIntervencionInput {
  tareas_realizadas?: string;
  horas_hombre?: number;
}