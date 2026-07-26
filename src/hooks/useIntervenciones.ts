'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createIntervencion,
  deleteIntervencion,
  getIntervenciones,
  updateIntervencion,
} from '@/services/intervenciones';
import type {
  ActualizarIntervencionInput,
  Intervencion,
  NuevaIntervencionInput,
} from '@/types/intervencion';
import type { PaginationMeta } from '@/types/common';

const DEFAULT_META: PaginationMeta = { page: 1, perPage: 20, total: 0, lastPage: 1 };

export function useIntervenciones(otId: string) {
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntervenciones = useCallback(async () => {
    if (!otId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getIntervenciones(otId);
      setIntervenciones(res.intervenciones);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las intervenciones.');
    } finally {
      setLoading(false);
    }
  }, [otId]);

  useEffect(() => { void fetchIntervenciones(); }, [fetchIntervenciones]);

  const refetch = useCallback(async () => { await fetchIntervenciones(); }, [fetchIntervenciones]);

  const crearIntervencion = useCallback(async (input: NuevaIntervencionInput) => {
    await createIntervencion(otId, input);
    await refetch();
  }, [otId, refetch]);

  const editarIntervencion = useCallback(async (id: string, input: ActualizarIntervencionInput) => {
    await updateIntervencion(otId, id, input);
    await refetch();
  }, [otId, refetch]);

  const eliminarIntervencion = useCallback(async (id: string) => {
    try {
      await deleteIntervencion(otId, id);
      await refetch();
    } catch (err) {
      throw err instanceof ApiError ? err : new Error('Error al eliminar intervencion.');
    }
  }, [otId, refetch]);

  return {
    intervenciones, meta, loading, error,
    empty: !loading && intervenciones.length === 0,
    refetch, crearIntervencion, editarIntervencion, eliminarIntervencion,
  };
}