'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getReporteById, updateReporte, deleteReporte } from '@/services/reportes';
import type { ActualizarReporteInput, Reporte } from '@/types/reporte';

export function useReporteDetalle(id: string) {
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReporte = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getReporteById(id);
      setReporte(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el reporte.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchReporte();
  }, [fetchReporte]);

  const refetch = useCallback(async () => {
    await fetchReporte();
  }, [fetchReporte]);

  const editarReporte = useCallback(
    async (input: ActualizarReporteInput) => {
      const updated = await updateReporte(id, input);
      if (updated) setReporte(updated);
      return updated;
    },
    [id],
  );

  const eliminarReporte = useCallback(async () => {
    await deleteReporte(id);
  }, [id]);

  return {
    reporte,
    loading,
    error,
    refetch,
    editarReporte,
    eliminarReporte,
  };
}
