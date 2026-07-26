'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { createMovimiento, createRepuesto, deleteRepuesto, getRepuestos, updateRepuesto } from '@/services/repuestos';
import type { ActualizarRepuestoInput, NuevoMovimientoInput, NuevoRepuestoInput, Repuesto } from '@/types/repuesto';
import type { PaginationMeta } from '@/types/common';

const DEFAULT_META: PaginationMeta = { page: 1, perPage: 15, total: 0, lastPage: 1 };

export function useRepuestos({ page = 1, perPage = 15 }: { page?: number; perPage?: number } = {}) {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepuestos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRepuestos({ page, perPage });
      setRepuestos(res.repuestos);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los repuestos.');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { void fetchRepuestos(); }, [fetchRepuestos]);

  const refetch = useCallback(async () => { await fetchRepuestos(); }, [fetchRepuestos]);

  const crearRepuesto = useCallback(async (input: NuevoRepuestoInput) => {
    await createRepuesto(input);
    await refetch();
  }, [refetch]);

  const editarRepuesto = useCallback(async (id: string, input: ActualizarRepuestoInput) => {
    await updateRepuesto(id, input);
    await refetch();
  }, [refetch]);

  const eliminarRepuesto = useCallback(async (id: string) => {
    await deleteRepuesto(id);
    await refetch();
  }, [refetch]);

  const registrarMovimiento = useCallback(async (repuestoId: string, input: NuevoMovimientoInput) => {
    await createMovimiento(repuestoId, input);
    await refetch();
  }, [refetch]);

  return {
    repuestos, meta, loading, error,
    empty: !loading && repuestos.length === 0,
    refetch, crearRepuesto, editarRepuesto, eliminarRepuesto, registrarMovimiento,
  };
}