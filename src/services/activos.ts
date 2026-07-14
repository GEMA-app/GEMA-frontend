/**
 * @module services/activos
 *
 * Capa de acceso a datos para el recurso "Activos" (`/v1/empresas/:id/activos`).
 * Todas las funciones requieren una sesión autenticada con empresa seleccionada.
 *
 * Dependencias externas:
 * - `@/lib/api` — `fetchWithAuth`, `requireEmpresaId`
 * - `@/lib/activos` — normalizadores y mappers JSON:API
 * - `@/lib/pagination` — construcción de query strings paginados
 * - `@/services/catalogo` — búsqueda/creación de artículos de catálogo
 *
 * Re-exportaciones:
 * - `getCatalogArticle` se re-exporta aquí para compatibilidad con imports existentes.
 *   Preferir importar directamente desde `@/services/catalogo` en código nuevo.
 */

import { buildOffsetQuery } from '@/lib/pagination';
import {
  extractActivosFromResponse,
  extractActivosMeta,
  normalizeAssetStatus,
} from '@/lib/activos';
import type {
  ActivoResponse,
  ActivosQuery,
  ActivosResponse,
  CreateActivoForm,
} from '@/types/activo';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import {
  findOrCreateCatalogArticle,
  getCatalogArticle,
} from '@/services/catalogo';

// Re-exportar para backward compatibility con imports existentes en páginas de activos.
// @see @/services/catalogo para la implementación original.
export { getCatalogArticle };

// Consultas

/**
 * Obtiene el listado paginado de activos de la empresa autenticada.
 *
 * @param params - Filtros opcionales: búsqueda, estado, ubicación y paginación.
 * @returns Lista de activos normalizados y metadatos de paginación.
 *
 * @throws {ApiError} Si la solicitud falla (autenticación, red, etc.).
 */
export async function getActivos(params: ActivosQuery = {}): Promise<ActivosResponse> {
  const empresaId = await requireEmpresaId();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;

  const query = buildOffsetQuery({
    page,
    perPage,
    search: params.search,
    estado: params.estado,
    ubicacion_id: params.ubicacionId,
  });

  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/activos${query}`,
  );

  return {
    activos: extractActivosFromResponse(payload),
    meta: extractActivosMeta(payload, page, perPage),
  };
}

/**
 * Obtiene los datos completos de un activo individual.
 * Devuelve el payload crudo del backend (snake_case) para uso en formularios y fichas.
 *
 * @param id - UUID del activo.
 * @returns Datos detallados del activo tal como los devuelve el backend.
 *
 * @throws {ApiError} Si el activo no existe o no pertenece a la empresa.
 */
export async function getActivo(id: string): Promise<ActivoResponse> {
  const empresaId = await requireEmpresaId();
  const res = await fetchWithAuth<{
    data: { id: string; attributes: Record<string, unknown> };
  }>(`/v1/empresas/${empresaId}/activos/${id}`);

  const a = res.data.attributes;

  return {
    id: res.data.id,
    serial_interno: a.serial_interno as string,
    codigo_activo: a.codigo_activo as string,
    estado: a.estado as string,
    ubicacion_id: (a.ubicacion_id as string) || null,
    fecha_adquisicion: (a.fecha_adquisicion as string) || null,
    valor_monetario: (a.valor_monetario as number) ?? null,
    moneda: (a.moneda as string) || 'USD',
    articulo_id: a.articulo_id as string,
    version: a.version as number,
  };
}

// Mutaciones

/**
 * Crea un nuevo activo en el inventario de la empresa.
 *
 * Proceso:
 * 1. Busca o crea el artículo de catálogo correspondiente al nombre y marca.
 * 2. Envía el activo al backend con los campos transformados a snake_case.
 *
 * @param data - Datos del formulario de registro.
 *
 * @throws {ApiError} Si la creación falla (validación, duplicados, etc.).
 */
export async function createActivo(data: CreateActivoForm): Promise<void> {
  const empresaId = await requireEmpresaId();

  // Buscar o crear el artículo de catálogo para asociarlo al activo.
  const articuloId = await findOrCreateCatalogArticle(data.nombre, data.marca);

  // Parsear el valor monetario: acepta comas como separador decimal.
  const valor = data.valorMonetario
    ? parseFloat(data.valorMonetario.replace(',', '.'))
    : null;

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'assets',
        attributes: {
          articulo_id: articuloId,
          serial_interno: data.nombre,
          codigo_activo: data.codigo,
          estado: normalizeAssetStatus(data.estadoInicial),
          ubicacion_id: data.ubicacion || null,
          fecha_adquisicion: data.fechaCompra || null,
          valor_monetario: valor,
          moneda: data.moneda || 'USD',
        },
      },
    },
  });
}

/**
 * Actualiza parcialmente un activo existente (PATCH).
 * Solo se incluyen los campos presentes en `data` (no `undefined`).
 * El campo `version` es obligatorio para el control de concurrencia optimista del backend.
 *
 * @param id - UUID del activo a actualizar.
 * @param data - Campos a actualizar más la `version` actual.
 *
 * @throws {ApiError} Si la versión es incorrecta (conflicto) o la validación falla.
 */
export async function updateActivo(
  id: string,
  data: Partial<CreateActivoForm> & { version: number },
): Promise<void> {
  const empresaId = await requireEmpresaId();

  // Construir solo los atributos que se van a modificar.
  const attrs: Record<string, unknown> = { version: data.version };

  if (data.nombre !== undefined) attrs.serial_interno = data.nombre;
  if (data.codigo !== undefined) attrs.codigo_activo = data.codigo;
  if (data.ubicacion !== undefined) attrs.ubicacion_id = data.ubicacion || null;
  if (data.fechaCompra !== undefined) attrs.fecha_adquisicion = data.fechaCompra || null;
  if (data.estadoInicial !== undefined) attrs.estado = normalizeAssetStatus(data.estadoInicial);
  if (data.valorMonetario !== undefined) {
    attrs.valor_monetario = data.valorMonetario
      ? parseFloat(data.valorMonetario.replace(',', '.'))
      : null;
  }
  if (data.moneda !== undefined) attrs.moneda = data.moneda || 'USD';

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'assets', attributes: attrs } },
  });
}

/**
 * Elimina permanentemente un activo del inventario.
 *
 * @param id - UUID del activo a eliminar.
 *
 * @throws {ApiError} Si el activo no existe o no se puede eliminar.
 */
export async function deleteActivo(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/activos/${id}`, {
    method: 'DELETE',
  });
}
