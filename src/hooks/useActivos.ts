'use client';

/**
 * @module hooks/useActivos
 *
 * Hook React para gestionar el estado del listado de activos.
 * Encapsula la carga, paginación, búsqueda y mutaciones (crear, editar, eliminar),
 * exponiendo una interfaz limpia para los componentes de la sección de activos.
 *
 * Uso típico:
 * ```tsx
 * const { activos, loading, error, crearActivo } = useActivos({ page: 1, search: query });
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createActivo,
  deleteActivo,
  getActivos,
  updateActivo,
} from '@/services/activos';
import type { Activo, ActivoEstado, ActivosQuery, CreateActivoForm } from '@/types/activo';
import type { PaginationMeta } from '@/types/common';

// Constantes

/** Metadatos de paginación por defecto mientras se carga la primera página. */
const DEFAULT_META: PaginationMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

// Tipos del hook

/**
 * Opciones de filtrado y paginación que recibe el hook.
 * Todos los campos son opcionales; los cambios disparan un refetch automático.
 */
export interface UseActivosOptions {
  /** Texto de búsqueda libre (debounced recomendado antes de pasarlo al hook). */
  search?: string;
  /** Filtrar por estado operacional. */
  estado?: ActivoEstado;
  /** Filtrar por UUID de ubicación. */
  ubicacionId?: string;
  /** Página actual (base 1). Por defecto: `1`. */
  page?: number;
  /** Resultados por página. Por defecto: `15`. */
  perPage?: number;
}

// Hook

/**
 * Hook que gestiona el listado paginado de activos y sus mutaciones.
 *
 * - Recarga automáticamente cuando cambian los filtros o la página.
 * - Todas las mutaciones (`crearActivo`, `editarActivo`, `eliminarActivo`)
 *   refrescan la lista al completarse.
 *
 * @param options - Filtros y paginación opcionales.
 * @returns Estado de carga, lista de activos, metadatos y funciones de mutación.
 */
export function useActivos({
  search = '',
  estado,
  ubicacionId,
  page = 1,
  perPage = 15,
}: UseActivosOptions = {}) {
  // State
  const [activos, setActivos] = useState<Activo[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch

  /** Carga (o recarga) la lista de activos aplicando los filtros actuales. */
  const fetchActivos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query: ActivosQuery = {
      page,
      perPage,
      search: search || undefined,
      estado,
      ubicacionId: ubicacionId || undefined,
    };

    try {
      const response = await getActivos(query);
      setActivos(response.activos);
      setMeta(response.meta);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los activos.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, estado, ubicacionId]);

  // Refetch automático al cambiar filtros o paginación.
  useEffect(() => {
    void fetchActivos();
  }, [fetchActivos]);

  // Mutations

  /** Fuerza una recarga manual de la lista. Útil tras acciones externas. */
  const refetch = useCallback(async () => {
    await fetchActivos();
  }, [fetchActivos]);

  /**
   * Crea un nuevo activo y recarga la lista.
   * @throws Propaga los errores del servicio para manejo en el componente.
   */
  const crearActivo = useCallback(
    async (data: CreateActivoForm) => {
      await createActivo(data);
      await refetch();
    },
    [refetch],
  );

  /**
   * Actualiza un activo existente y recarga la lista.
   * @param id - UUID del activo a editar.
   * @param data - Campos a modificar más la versión actual.
   */
  const editarActivo = useCallback(
    async (id: string, data: Partial<CreateActivoForm> & { version: number }) => {
      await updateActivo(id, data);
      await refetch();
    },
    [refetch],
  );

  /**
   * Elimina un activo y recarga la lista.
   * @param id - UUID del activo a eliminar.
   */
  const eliminarActivo = useCallback(
    async (id: string) => {
      await deleteActivo(id);
      await refetch();
    },
    [refetch],
  );

  // Return

  return {
    /** Lista de activos normalizados para la página actual. */
    activos,
    /** Metadatos de paginación (página, total, última página). */
    meta,
    /** `true` mientras se realiza una petición de carga o recarga. */
    loading,
    /** Mensaje de error o `null` si no hubo errores. */
    error,
    /** `true` cuando la lista está vacía y ya terminó de cargar. */
    empty: !loading && activos.length === 0,
    refetch,
    crearActivo,
    editarActivo,
    eliminarActivo,
  };
}