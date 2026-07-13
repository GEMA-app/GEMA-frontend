'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { computeReportesStats } from '@/lib/reportes';
import { mockFetchReportes, mockFetchReportesResumen } from '@/data/mockReportesApi';
import { MOCK_REPORTES } from '@/data/mockReportes';
import {
  createReporte,
  getReportes,
  getReportesResumen,
  isReportesMockMode,
} from '@/services/reportes';
import type {
  NuevoReporteInput,
  Reporte,
  ReporteFiltroTipo,
  ReportesMeta,
  ReportesResumen,
} from '@/types/reporte';

export interface UseReportesOptions {
  search?: string;
  tipo?: ReporteFiltroTipo;
  page?: number;
  perPage?: number;
}

const EMPTY_STATS: ReportesResumen = {
  alertasCriticas: 0,
  enProceso: 0,
  completados: 0,
};

const DEFAULT_META: ReportesMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

export function useReportes({
  search = '',
  tipo = 'todos',
  page = 1,
  perPage = 15,
}: UseReportesOptions = {}) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [meta, setMeta] = useState<ReportesMeta>(DEFAULT_META);
  const [stats, setStats] = useState<ReportesResumen>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(isReportesMockMode);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = { page, perPage, search, tipo };

    try {
      const [lista, resumen] = await Promise.all([
        getReportes(query),
        getReportesResumen(),
      ]);

      setReportes(lista.reportes);
      setMeta(lista.meta);
      setStats(resumen);
      setIsMock(isReportesMockMode);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los reportes de mantenimiento.';

      const fallbackLista = mockFetchReportes(query);
      setReportes(fallbackLista.reportes);
      setMeta(fallbackLista.meta);
      setStats(mockFetchReportesResumen());
      setIsMock(true);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, tipo]);

  useEffect(() => {
    void fetchReportes();
  }, [fetchReportes]);

  const refetch = useCallback(async () => {
    await fetchReportes();
  }, [fetchReportes]);

  const crearReporte = useCallback(
    async (input: NuevoReporteInput) => {
      const nuevo = await createReporte(input, meta.total + 1);
      await refetch();
      return nuevo;
    },
    [meta.total, refetch],
  );

  return {
    reportes,
    meta,
    stats,
    loading,
    error,
    isMock,
    empty: !loading && reportes.length === 0,
    refetch,
    crearReporte,
  };
}
