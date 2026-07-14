'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getActivos, deleteActivo } from '@/services/activos';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import type { Activo, ActivosQuery, NuevoActivoInput } from '@/types/activo';
import type { PaginationMeta } from '@/types/common';

const DEFAULT_META: PaginationMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

export interface UseActivosOptions {
  page?: number;
  perPage?: number;
  search?: string;
  estado?: string;
  ubicacionId?: string;
}

export function useActivos({
  page = 1,
  perPage = 15,
  search = '',
  estado,
  ubicacionId,
}: UseActivosOptions = {}) {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ubicaciones } = useUbicaciones();

  const ubicacionMap = useMemo(() => {
    const map: Record<string, string> = {};
    const walk = (items: Array<{ id: string; nombre: string; hijos?: unknown[] }>) => {
      for (const item of items) {
        map[item.id] = item.nombre;
        if (Array.isArray(item.hijos)) walk(item.hijos as typeof items);
      }
    };
    if (ubicaciones) walk(ubicaciones);
    return map;
  }, [ubicaciones]);

  const fetchActivos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: ActivosQuery = {
        page,
        perPage,
        search: search || undefined,
        estado: (estado as ActivosQuery['estado']) || undefined,
        ubicacionId: ubicacionId || undefined,
      };
      const response = await getActivos(query);

      const enriquecidos = response.activos.map((a) => ({
        ...a,
        ubicacion: ubicacionMap[a.ubicacion] || a.ubicacion || 'N/A',
      }));

      setActivos(enriquecidos);
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
  }, [page, perPage, search, estado, ubicacionId, ubicacionMap]);

  useEffect(() => {
    void fetchActivos();
  }, [fetchActivos]);

  const refetch = useCallback(async () => {
    await fetchActivos();
  }, [fetchActivos]);

  const eliminarActivo = useCallback(
    async (id: string) => {
      await deleteActivo(id);
      await refetch();
    },
    [refetch],
  );

  return {
    activos,
    meta,
    loading,
    error,
    empty: !loading && activos.length === 0,
    refetch,
    eliminarActivo,
  };
}
