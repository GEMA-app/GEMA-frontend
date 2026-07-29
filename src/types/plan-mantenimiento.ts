import type { PaginationMeta } from '@/types/common';

export type TipoMantenimiento = 'preventivo' | 'correctivo' | 'predictivo';

export interface PlanMantenimiento {
  id: string;
  activo_id: string;
  nombre: string;
  tipo: TipoMantenimiento;
  intervalo_dias: number;
  proxima_ejecucion: string;
  tecnico_responsable_id: string | null;
  descripcion_tareas: string | null;
  activo: boolean;
  es_urgente: boolean;
  ejecuciones: EjecucionResumen[];
}

export interface EjecucionResumen {
  id: string;
  work_order_id: string;
  execution_date: string;
  observations: string | null;
}

export interface PlanesQuery {
  page?: number;
  perPage?: number;
  activo_id?: string;
  tipo?: TipoMantenimiento;
  activo?: boolean;
}

export interface PlanesResponse {
  planes: PlanMantenimiento[];
  meta: PaginationMeta;
}

export interface NuevoPlanInput {
  activo_id: string;
  nombre: string;
  tipo: TipoMantenimiento;
  intervalo_dias: number;
  proxima_ejecucion: string;
  tecnico_responsable_id?: string;
  descripcion_tareas?: string;
}

export interface ActualizarPlanInput {
  nombre?: string;
  tipo?: TipoMantenimiento;
  intervalo_dias?: number;
  proxima_ejecucion?: string;
  tecnico_responsable_id?: string;
  descripcion_tareas?: string;
  activo?: boolean;
}

export interface EjecucionPlan {
  id: string;
  plan_id: string;
  work_order_id: string;
  execution_date: string;
  observations: string | null;
  created_at: string | null;
}

export interface NuevaEjecucionInput {
  plan_id: string;
  work_order_id: string;
  execution_date?: string;
  observations?: string;
}