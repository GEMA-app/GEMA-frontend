'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { createReporte, deleteReporte, getReportes, updateReporte } from '@/services/reportes';
import type {
  ActualizarReporteInput,
  NuevoReporteInput,
  Reporte,
  ReportesQuery,
} from '@/types/reporte';
import type { PaginationMeta } from '@/types/common';

const DEFAULT_META: PaginationMeta = { page: 1, perPage: 10, total: 0, lastPage: 1 };

export function useReportes(filters: ReportesQuery = {}) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(filtersKey) as ReportesQuery;
      const res = await getReportes(parsed);
      setReportes(res.reportes);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => { void fetchReportes(); }, [fetchReportes]);

  const refetch = useCallback(async () => { await fetchReportes(); }, [fetchReportes]);

  const crearReporte = useCallback(async (input: NuevoReporteInput) => {
    await createReporte(input);
    await refetch();
  }, [refetch]);

  const editarReporte = useCallback(async (id: string, input: ActualizarReporteInput) => {
    await updateReporte(id, input);
    await refetch();
  }, [refetch]);

  const eliminarReporte = useCallback(async (id: string) => {
    await deleteReporte(id);
    await refetch();
  }, [refetch]);

  return {
    reportes, meta, loading, error,
    empty: !loading && reportes.length === 0,
    refetch, crearReporte, editarReporte, eliminarReporte,
  };
}