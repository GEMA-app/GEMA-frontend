/**
 * Meta de paginación genérica para todos los módulos.
 * Patrón unificado: offset/limit.
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}
