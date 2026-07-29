'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { createEjecucion, getEjecuciones } from '@/services/ejecuciones-plan';
import type { EjecucionPlan, NuevaEjecucionInput } from '@/types/plan-mantenimiento';

export function useEjecucionesPlan(planId: string) {
  const [ejecuciones, setEjecuciones] = useState<EjecucionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEjecuciones = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      setEjecuciones(await getEjecuciones(planId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las ejecuciones.');
      setEjecuciones([]);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void fetchEjecuciones();
  }, [fetchEjecuciones]);

  const refetch = useCallback(async () => {
    await fetchEjecuciones();
  }, [fetchEjecuciones]);

  const crearEjecucion = useCallback(
    async (input: Omit<NuevaEjecucionInput, 'plan_id'>) => {
      await createEjecucion({ ...input, plan_id: planId });
      await refetch();
    },
    [planId, refetch]
  );

  return {
    ejecuciones,
    loading,
    error,
    empty: !loading && ejecuciones.length === 0,
    refetch,
    crearEjecucion,
  };
}
