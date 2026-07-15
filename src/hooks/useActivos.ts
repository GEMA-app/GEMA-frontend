'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createActivo,
  deleteActivo,
  getActivos,
  updateActivo,
} from '@/services/activos';
import type { Activo, ActivoEstado, ActivosQuery } from '@/types/activo';
import type { PaginationMeta } from '@/types/common';
import type { CreateActivoForm } from '@/services/activos';

const DEFAULT_META: PaginationMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

export interface UseActivosOptions {
  search?: string;
  estado?: ActivoEstado;
  ubicacionId?: string;
  page?: number;
  perPage?: number;
}

export function useActivos({
  search = '',
  estado,
  ubicacionId,
  page = 1,
  perPage = 15,
}: UseActivosOptions = {}) {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    void fetchActivos();
  }, [fetchActivos]);

  const refetch = useCallback(async () => {
    await fetchActivos();
  }, [fetchActivos]);

  const crearActivo = useCallback(
    async (data: CreateActivoForm) => {
      await createActivo(data);
      await refetch();
    },
    [refetch],
  );

  const editarActivo = useCallback(
    async (id: string, data: Partial<CreateActivoForm> & { version: number }) => {
      await updateActivo(id, data);
      await refetch();
    },
    [refetch],
  );

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
    crearActivo,
    editarActivo,
    eliminarActivo,
  };
}