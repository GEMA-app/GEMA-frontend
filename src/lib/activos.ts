import {
  extractResourceList,
  type JsonApiResource,
} from '@/lib/jsonapi';
import { extractMetaFromResponse } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/common';
import type { Activo, ActivoEstado } from '@/types/activo';

// ── Normalizadores ──

const ESTADO_MAP: Record<string, ActivoEstado> = {
  'operativo': 'operativo',
  'en_mantenimiento': 'en_mantenimiento',
  'fuera_de_servicio': 'fuera_de_servicio',
  'dado_de_baja': 'dado_de_baja',
};

export function normalizeAssetStatus(raw: string): ActivoEstado {
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, '_');
  return ESTADO_MAP[normalized] || 'operativo';
}

const ESTADO_LABELS: Record<ActivoEstado, string> = {
  'operativo': 'Operativo',
  'en_mantenimiento': 'En mantenimiento',
  'fuera_de_servicio': 'Fuera de servicio',
  'dado_de_baja': 'Dado de baja',
};

export function formatEstadoActivo(estado: string): string {
  return ESTADO_LABELS[estado as ActivoEstado] || estado;
}

// ── Mappers JSON:API ──

export function mapActivoFromApi(resource: JsonApiResource): Activo {
  const attrs = resource.attributes;
  const ubiId = (attrs.ubicacion_id as string) || null;

  return {
    id: resource.id,
    nombre: (attrs.serial_interno as string) || 'Sin nombre',
    serial: (attrs.codigo_activo as string) || 'N/A',
    ubicacion: ubiId || 'N/A', // El hook resuelve el nombre vía useUbicaciones
    estado: normalizeAssetStatus((attrs.estado as string) || 'operativo'),
    articuloId: (attrs.articulo_id as string) || null,
    valorMonetario: (attrs.valor_monetario as number) ?? null,
    moneda: (attrs.moneda as string) || 'USD',
  };
}

export function extractActivosFromResponse(payload: unknown): Activo[] {
  return extractResourceList(payload).map(mapActivoFromApi);
}

export function extractActivosMeta(
  payload: unknown,
  fallbackPage: number = 1,
  fallbackPerPage: number = 15,
): PaginationMeta {
  return extractMetaFromResponse(payload, fallbackPage, fallbackPerPage);
}
