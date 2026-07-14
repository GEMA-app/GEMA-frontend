/**
 * @module types/activo
 *
 * Definiciones de tipos del dominio "Activos" (equipos del inventario).
 * Estas interfaces son la fuente de verdad compartida entre servicios,
 * hooks y componentes. No incluyen lógica de presentación.
 */

import type { PaginationMeta } from '@/types/common';

// Enumeraciones

/**
 * Estados posibles de un activo, tal como los devuelve y acepta la API.
 * El prefijo de snake_case coincide con los valores del backend.
 */
export type ActivoEstado =
  | 'operativo'
  | 'en_mantenimiento'
  | 'fuera_de_servicio'
  | 'dado_de_baja';

// Entidades

/**
 * Representación normalizada de un activo para uso en listados y tablas.
 * Los campos ya están transformados desde la respuesta JSON:API del backend.
 */
export interface Activo {
  /** UUID del activo. */
  id: string;
  /** Nombre del activo (mapeado desde `serial_interno`). */
  nombre: string;
  /** Código de inventario (mapeado desde `codigo_activo`). */
  serial: string;
  /** ID de ubicación; la página resuelve el nombre vía `useUbicaciones`. */
  ubicacion: string;
  /** Estado normalizado del activo. */
  estado: ActivoEstado;
}

// Parámetros de consulta

/**
 * Parámetros opcionales para filtrar y paginar el listado de activos.
 */
export interface ActivosQuery {
  /** Página actual (base 1). */
  page?: number;
  /** Número de resultados por página. */
  perPage?: number;
  /** Texto libre para buscar por nombre o código. */
  search?: string;
  /** Filtrar por estado operacional. */
  estado?: ActivoEstado;
  /** Filtrar por UUID de ubicación. */
  ubicacionId?: string;
}

// Respuestas de API

/**
 * Respuesta paginada del endpoint `GET /activos`.
 */
export interface ActivosResponse {
  activos: Activo[];
  meta: PaginationMeta;
}

/**
 * Payload detallado de un activo individual (`GET /activos/:id`).
 * Conserva los nombres de campo originales del backend para edición y ficha.
 */
export interface ActivoResponse {
  id: string;
  serial_interno: string;
  codigo_activo: string;
  estado: string;
  ubicacion_id: string | null;
  fecha_adquisicion: string | null;
  valor_monetario: number | null;
  moneda: string;
  /** UUID del artículo de catálogo asociado a este activo. */
  articulo_id: string;
  /** Versión para control de concurrencia optimista. */
  version: number;
}

// Formularios

/**
 * Datos del formulario de creación/edición de un activo.
 * Los nombres en camelCase corresponden a los campos del formulario React;
 * el servicio los traduce a snake_case antes de enviar a la API.
 */
export interface CreateActivoForm {
  /** Nombre o descripción del activo (se guarda como `serial_interno`). */
  nombre: string;
  /** Código de inventario (se guarda como `codigo_activo`). */
  codigo: string;
  /** Marca o fabricante (se usa para buscar/crear en el catálogo). */
  marca: string;
  /** UUID de ubicación seleccionada. Puede ser vacío si no aplica. */
  ubicacion: string;
  /** Fecha de compra en formato ISO (`YYYY-MM-DD`). */
  fechaCompra: string;
  /** Valor monetario como string para admitir comas y decimales. */
  valorMonetario: string;
  /** Código de moneda ISO 4217 (p.ej. `"USD"`, `"VES"`). */
  moneda: string;
  /** Estado inicial del activo en formato de display (p.ej. `"Operativo"`). */
  estadoInicial: string;
}

// Catálogo

/**
 * Artículo de catálogo asociado a un activo.
 * Contiene metadatos de fabricante y modelo.
 */
export interface CatalogArticleResponse {
  id: string;
  /** Nombre del artículo en el catálogo. */
  name: string;
  /** Fabricante o marca. Puede ser `null` si no fue especificado. */
  manufacturer: string | null;
  /** Modelo del artículo. Puede ser `null`. */
  model: string | null;
}
