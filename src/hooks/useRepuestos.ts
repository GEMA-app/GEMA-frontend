'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createRepuesto,
  deleteRepuesto,
  getRepuestos,
  updateRepuesto,
} from '@/services/repuestos';
import type {
  ActualizarRepuestoInput,
  NuevoRepuestoInput,
  Repuesto,
  RepuestosMeta,
} from '@/types/repuesto';

const DEFAULT_META: RepuestosMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

export interface UseRepuestosOptions {
  page?: number;
  perPage?: number;
  search?: string;
}

export function useRepuestos({ page = 1, perPage = 15, search = '' }: UseRepuestosOptions = {}) {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [meta, setMeta] = useState<RepuestosMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepuestos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRepuestos({ page, perPage, search });
      setRepuestos(response.repuestos);
      setMeta(response.meta);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los repuestos.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void fetchRepuestos();
  }, [fetchRepuestos]);

  const refetch = useCallback(async () => {
    await fetchRepuestos();
  }, [fetchRepuestos]);

  const crearRepuesto = useCallback(
    async (input: NuevoRepuestoInput) => {
      await createRepuesto(input);
      await refetch();
    },
    [refetch],
  );

  const editarRepuesto = useCallback(
    async (id: string, input: ActualizarRepuestoInput) => {
      await updateRepuesto(id, input);
      await refetch();
    },
    [refetch],
  );

  const eliminarRepuesto = useCallback(
    async (id: string) => {
      await deleteRepuesto(id);
      await refetch();
    },
    [refetch],
  );

  return {
    repuestos,
    meta,
    loading,
    error,
    empty: !loading && repuestos.length === 0,
    refetch,
    crearRepuesto,
    editarRepuesto,
    eliminarRepuesto,
  };
}
