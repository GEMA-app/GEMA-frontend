import type { HistorialEstadoOT, OrdenTrabajo } from '@/types/orden-trabajo';

export function mapOrdenFromApi(resource: { id: string; attributes: Record<string, unknown> }): OrdenTrabajo {
  const a = resource.attributes;
  return {
    id: resource.id,
    codigo_ot: (a.codigo_ot as string) ?? '',
    activo_id: (a.activo_id as string) ?? '',
    tipo: (a.tipo as OrdenTrabajo['tipo']) ?? 'correctivo',
    estado: (a.estado as OrdenTrabajo['estado']) ?? 'abierta',
    descripcion_trabajo: (a.descripcion_trabajo as string | null) ?? null,
    supervisor_id: (a.supervisor_id as string | null) ?? null,
    reporte_id: (a.reporte_id as string | null) ?? null,
    plan_id: (a.plan_id as string | null) ?? null,
    fecha_apertura: (a.fecha_apertura as string) ?? '',
    fecha_cierre: (a.fecha_cierre as string | null) ?? null,
    fecha_inicio_trabajo: (a.fecha_inicio_trabajo as string | null) ?? null,
    costo_estimado: (a.costo_estimado as number | null) ?? null,
    costo_real: (a.costo_real as number | null) ?? null,
    moneda: (a.moneda as string) ?? 'USD',
    validado_por_id: (a.validado_por_id as string | null) ?? null,
    fecha_validacion: (a.fecha_validacion as string | null) ?? null,
    version: (a.version as number) ?? 1,
  };
}

export function mapHistorialFromApi(resource: { id: string; attributes: Record<string, unknown> }): HistorialEstadoOT {
  const a = resource.attributes;
  return {
    id: resource.id,
    orden_trabajo_id: (a.ordenes_trabajo_id as string) ?? (a.orden_trabajo_id as string) ?? '',
    estado_anterior: (a.estado_anterior as HistorialEstadoOT['estado_anterior']) ?? null,
    estado_nuevo: (a.estado_nuevo as HistorialEstadoOT['estado_nuevo']) ?? 'abierta',
    motivo: (a.motivo as string | null) ?? null,
    fecha_cambio: (a.fecha_cambio as string) ?? '',
    usuario_id: (a.usuario_id as string | null) ?? null,
  };
}
