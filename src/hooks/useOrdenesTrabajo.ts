'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { extractOrdenesMeta } from '@/lib/orden-trabajo';
import { getOrdenes, createOrden, updateOrden, deleteOrden } from '@/services/ordenes-trabajo';
import type { OrdenTrabajo, OrdenesQuery, NuevaOrdenInput, ActualizarOrdenInput } from '@/types/orden-trabajo';

const DEFAULT_META = { total: 0, offset: 0, limit: 15, lastPage: 1, page: 1, hasMore: false };

export function useOrdenesTrabajo(filters: OrdenesQuery = {}) {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(filtersKey) as OrdenesQuery;
      const response = await getOrdenes(parsed);
      setOrdenes(response.ordenes);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las órdenes de trabajo.');
      setOrdenes([]);
      setMeta(DEFAULT_META);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => { void fetchOrdenes(); }, [fetchOrdenes]);

  const crearOrden = useCallback(async (input: NuevaOrdenInput): Promise<OrdenTrabajo> => {
    const orden = await createOrden(input);
    setOrdenes(prev => [orden, ...prev]);
    return orden;
  }, []);

  const actualizarOrden = useCallback(async (id: string, input: ActualizarOrdenInput): Promise<OrdenTrabajo> => {
    const orden = await updateOrden(id, input);
    setOrdenes(prev => prev.map(o => o.id === id ? orden : o));
    return orden;
  }, []);

  const eliminarOrden = useCallback(async (id: string): Promise<void> => {
    await deleteOrden(id);
    setOrdenes(prev => prev.filter(o => o.id !== id));
  }, []);

  const refetch = useCallback(async () => { await fetchOrdenes(); }, [fetchOrdenes]);

  return {
    ordenes, meta, loading, error,
    empty: !loading && !error && ordenes.length === 0,
    crearOrden, actualizarOrden, eliminarOrden, refetch,
  };
}
