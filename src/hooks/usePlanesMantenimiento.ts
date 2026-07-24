'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { createPlan, deletePlan, getPlanes, updatePlan } from '@/services/planes-mantenimiento';
import type {
  ActualizarPlanInput,
  NuevoPlanInput,
  PlanMantenimiento,
  PlanesQuery,
} from '@/types/plan-mantenimiento';
import type { PaginationMeta } from '@/types/common';

const DEFAULT_META: PaginationMeta = { page: 1, perPage: 15, total: 0, lastPage: 1 };

export function usePlanesMantenimiento(filters: PlanesQuery = {}) {
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchPlanes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(filtersKey) as PlanesQuery;
      const res = await getPlanes(parsed);
      setPlanes(res.planes);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los planes.');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => { void fetchPlanes(); }, [fetchPlanes]);

  const refetch = useCallback(async () => { await fetchPlanes(); }, [fetchPlanes]);

  const crearPlan = useCallback(async (input: NuevoPlanInput) => {
    await createPlan(input);
    await refetch();
  }, [refetch]);

  const editarPlan = useCallback(async (id: string, input: ActualizarPlanInput) => {
    await updatePlan(id, input);
    await refetch();
  }, [refetch]);

  const eliminarPlan = useCallback(async (id: string) => {
    await deletePlan(id);
    await refetch();
  }, [refetch]);

  return {
    planes, meta, loading, error,
    empty: !loading && planes.length === 0,
    refetch, crearPlan, editarPlan, eliminarPlan,
  };
}