'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getHistorial, type HistorialQuery } from '@/services/historial';
import type { HistorialMeta } from '@/lib/historial';
import type { HistorialEntry } from '@/types/historial';

export interface HistorialFilters {
  search?: string;
  usuario_id?: string;
  modulo?: string;
  accion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_META: HistorialMeta = {
  page: 1,
  limit: 20,
  total: 0,
  lastPage: 1,
  hasMore: false,
};

export function useHistorial(filters: HistorialFilters = {}) {
  const [entries, setEntries] = useState<HistorialEntry[]>([]);
  const [meta, setMeta] = useState<HistorialMeta>(DEFAULT_META);
  const [page, setPage] = useState(filters.page ?? 1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      const parsedFilters = JSON.parse(filtersKey) as HistorialFilters;
      const query: HistorialQuery = {
        page: targetPage,
        limit: parsedFilters.limit ?? 20,
        search: parsedFilters.search,
        usuario_id: parsedFilters.usuario_id,
        modulo: parsedFilters.modulo,
        accion: parsedFilters.accion,
        fecha_desde: parsedFilters.fecha_desde,
        fecha_hasta: parsedFilters.fecha_hasta,
      };

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await getHistorial(query);
        setEntries((current) =>
          append ? [...current, ...response.entries] : response.entries,
        );
        setMeta(response.meta);
        setPage(targetPage);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo cargar el historial de auditoría.';
        setError(message);
        if (!append) {
          setEntries([]);
          setMeta(DEFAULT_META);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filtersKey],
  );

  useEffect(() => {
    const parsed = JSON.parse(filtersKey) as HistorialFilters;
    const initialPage = parsed.page ?? 1;
    setPage(initialPage);
    void fetchPage(initialPage, false);
  }, [fetchPage, filtersKey]);

  const loadMore = useCallback(async () => {
    if (!meta.hasMore || loadingMore) {
      return;
    }
    await fetchPage(page + 1, true);
  }, [fetchPage, meta.hasMore, loadingMore, page]);

  const refetch = useCallback(async () => {
    await fetchPage(1, false);
  }, [fetchPage]);

  return {
    entries,
    meta,
    loading,
    loadingMore,
    error,
    empty: !loading && !error && entries.length === 0,
    hasMore: meta.hasMore,
    loadMore,
    refetch,
  };
}
