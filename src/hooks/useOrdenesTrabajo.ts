'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  cambiarEstadoOT,
  createOrdenTrabajo,
  deleteOrdenTrabajo,
  getHistorialEstadosOT,
  getOrdenesTrabajo,
  updateOrdenTrabajo,
} from '@/services/ordenes-trabajo';
import type {
  ActualizarOrdenTrabajoInput,
  CambiarEstadoOTInput,
  HistorialEstadoOT,
  NuevaOrdenTrabajoInput,
  OrdenTrabajo,
  OrdenTrabajoQuery,
} from '@/types/orden-trabajo';
import type { PaginationMeta } from '@/types/common';

const DEFAULT_META: PaginationMeta = { page: 1, perPage: 15, total: 0, lastPage: 1 };

export function useOrdenesTrabajo(params: OrdenTrabajoQuery = {}) {
  const { page = 1, perPage = 15 } = params;
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrdenesTrabajo({ page, perPage });
      setOrdenes(res.ordenes);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las órdenes de trabajo.');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { void fetchOrdenes(); }, [fetchOrdenes]);

  const refetch = useCallback(async () => { await fetchOrdenes(); }, [fetchOrdenes]);

  const crearOrden = useCallback(async (input: NuevaOrdenTrabajoInput) => {
    const orden = await createOrdenTrabajo(input);
    await refetch();
    return orden;
  }, [refetch]);

  const editarOrden = useCallback(async (id: string, input: ActualizarOrdenTrabajoInput) => {
    const orden = await updateOrdenTrabajo(id, input);
    await refetch();
    return orden;
  }, [refetch]);

  const eliminarOrden = useCallback(async (id: string) => {
    await deleteOrdenTrabajo(id);
    await refetch();
  }, [refetch]);

  const cambiarEstado = useCallback(async (id: string, input: CambiarEstadoOTInput) => {
    const orden = await cambiarEstadoOT(id, input);
    await refetch();
    return orden;
  }, [refetch]);

  return {
    ordenes, meta, loading, error,
    empty: !loading && ordenes.length === 0,
    refetch, crearOrden, editarOrden, eliminarOrden, cambiarEstado,
  };
}

export function useHistorialEstadosOT(ordenId: string | null) {
  const [historial, setHistorial] = useState<HistorialEstadoOT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ordenId) return;
    setLoading(true);
    setError(null);
    getHistorialEstadosOT(ordenId)
      .then(setHistorial)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Error al cargar historial.');
      })
      .finally(() => setLoading(false));
  }, [ordenId]);

  return { historial, loading, error };
}
