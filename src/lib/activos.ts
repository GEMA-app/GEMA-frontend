/**
 * @module lib/activos
 *
 * Utilidades puras del dominio "Activos":
 *   - Normalización de estados (API → tipo interno)
 *   - Formateo de estados para display (tipo interno → label legible)
 *   - Estilos de badge por estado (para uso directo en componentes)
 *   - Mappers JSON:API → entidad `Activo`
 *
 * Este módulo NO debe importar desde React ni desde servicios de red.
 */

import {
  extractResourceList,
  type JsonApiResource,
} from '@/lib/jsonapi';
import { extractMetaFromResponse } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/common';
import type { Activo, ActivoEstado } from '@/types/activo';

// Normalización de estado

/**
 * Tabla de conversión de strings crudas del backend al tipo `ActivoEstado`.
 * Acepta variantes con y sin guión bajo, y las etiquetas de display del formulario.
 * El fallback es `'operativo'`.
 */
const ESTADO_MAP: Record<string, ActivoEstado> = {
  'operativo': 'operativo',
  'en mantenimiento': 'en_mantenimiento',
  'en_mantenimiento': 'en_mantenimiento',
  'para revisión': 'en_mantenimiento',
  'fuera_de_servicio': 'fuera_de_servicio',
  'dado_de_baja': 'dado_de_baja',
};

/**
 * Convierte un string de estado crudo (como lo devuelve el backend o el formulario)
 * al tipo interno `ActivoEstado`. La comparación es insensible a mayúsculas/minúsculas
 * y espacios al inicio/fin.
 *
 * @param raw - String de estado sin normalizar.
 * @returns El `ActivoEstado` correspondiente; `'operativo'` si no hay coincidencia.
 *
 * @example
 * normalizeAssetStatus('En Mantenimiento') // → 'en_mantenimiento'
 * normalizeAssetStatus('operativo')        // → 'operativo'
 */
export function normalizeAssetStatus(raw: string): ActivoEstado {
  return ESTADO_MAP[raw.trim().toLowerCase()] ?? 'operativo';
}

// Labels de display

/**
 * Mapa de `ActivoEstado` a etiqueta legible en español.
 * Es la fuente única de verdad para los labels de estado en la UI.
 */
const ESTADO_LABELS: Record<ActivoEstado, string> = {
  'operativo': 'Operativo',
  'en_mantenimiento': 'En mantenimiento',
  'fuera_de_servicio': 'Fuera de servicio',
  'dado_de_baja': 'Dado de baja',
};

/**
 * Formatea un estado de activo a su etiqueta legible en español.
 *
 * @param estado - Puede ser un `ActivoEstado` o cualquier string.
 * @returns El label localizado o el string original si no hay coincidencia.
 *
 * @example
 * formatEstadoActivo('en_mantenimiento') // → 'En mantenimiento'
 * formatEstadoActivo('desconocido')      // → 'desconocido'
 */
export function formatEstadoActivo(estado: string): string {
  return ESTADO_LABELS[estado as ActivoEstado] ?? estado;
}

// Estilos de badge

/**
 * Clases Tailwind para el badge de estado, indexadas por `ActivoEstado`.
 * Usar junto con `formatEstadoActivo` para renderizar el label.
 *
 * @example
 * const cls = ESTADO_BADGE_STYLES[activo.estado] ?? ESTADO_BADGE_STYLES._fallback;
 */
export const ESTADO_BADGE_STYLES: Record<ActivoEstado | '_fallback', string> = {
  'operativo': 'bg-[#E8F5E9] text-[#2E7D32]',
  'en_mantenimiento': 'bg-[#FFF3E0] text-[#E65100]',
  'fuera_de_servicio': 'bg-[#FCE4EC] text-[#C62828]',
  'dado_de_baja': 'bg-gray-100 text-gray-500',
  '_fallback': 'bg-gray-100 text-gray-500',
};

// Mappers JSON:API

/**
 * Transforma un recurso JSON:API de tipo `asset` en la entidad `Activo`.
 *
 * Mapeos de campo:
 * - `attributes.serial_interno` → `nombre`
 * - `attributes.codigo_activo` → `serial`
 * - `attributes.ubicacion_id` → `ubicacion` (el nombre se resuelve vía `useUbicaciones`)
 * - `attributes.estado` → `estado` (normalizado con `normalizeAssetStatus`)
 *
 * @param resource - Recurso JSON:API individual.
 * @returns Entidad `Activo` normalizada.
 */
export function mapActivoFromApi(resource: JsonApiResource): Activo {
  const attrs = resource.attributes;
  const ubiId = (attrs.ubicacion_id as string) || null;

  return {
    id: resource.id,
    nombre: (attrs.serial_interno as string) || 'Sin nombre',
    serial: (attrs.codigo_activo as string) || 'N/A',
    // El ID de ubicación se guarda; la página resuelve el nombre vía useUbicaciones.
    ubicacion: ubiId || 'N/A',
    estado: normalizeAssetStatus((attrs.estado as string) || 'operativo'),
  };
}

/**
 * Extrae y normaliza la lista de activos desde el payload JSON:API completo.
 *
 * @param payload - Respuesta cruda del endpoint `GET /activos`.
 * @returns Array de entidades `Activo` normalizadas.
 */
export function extractActivosFromResponse(payload: unknown): Activo[] {
  return extractResourceList(payload).map(mapActivoFromApi);
}

/**
 * Extrae los metadatos de paginación desde el payload JSON:API.
 *
 * @param payload - Respuesta cruda del endpoint `GET /activos`.
 * @param fallbackPage - Página actual a usar si no está en el payload.
 * @param fallbackPerPage - Tamaño de página a usar si no está en el payload.
 * @returns Metadatos de paginación normalizados.
 */
export function extractActivosMeta(
  payload: unknown,
  fallbackPage: number = 1,
  fallbackPerPage: number = 15,
): PaginationMeta {
  return extractMetaFromResponse(payload, fallbackPage, fallbackPerPage);
}
