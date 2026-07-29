'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createRepuestoUtilizado,
  deleteRepuestoUtilizado,
  getRepuestosUtilizados,
  updateRepuestoUtilizado,
} from '@/services/repuestos-utilizados';
import type { NuevoRepuestoUtilizadoInput, RepuestoUtilizado } from '@/types/repuesto-utilizado';

export function useRepuestosUtilizados(otId: string, intervencionId: string) {
  const [repuestosUtilizados, setRepuestosUtilizados] = useState<RepuestoUtilizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepuestos = useCallback(async () => {
    if (!otId || !intervencionId) return;
    setLoading(true);
    setError(null);
    try {
      const parts = await getRepuestosUtilizados(otId, intervencionId);
      setRepuestosUtilizados(parts);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los repuestos utilizados.');
    } finally {
      setLoading(false);
    }
  }, [otId, intervencionId]);

  useEffect(() => {
    void fetchRepuestos();
  }, [fetchRepuestos]);

  const refetch = useCallback(async () => {
    await fetchRepuestos();
  }, [fetchRepuestos]);

  const agregarRepuesto = useCallback(
    async (input: NuevoRepuestoUtilizadoInput) => {
      const created = await createRepuestoUtilizado(otId, intervencionId, input);
      await refetch();
      return created;
    },
    [otId, intervencionId, refetch],
  );

  const editarRepuesto = useCallback(
    async (id: string, cantidadUsada: number) => {
      const updated = await updateRepuestoUtilizado(otId, intervencionId, id, cantidadUsada);
      await refetch();
      return updated;
    },
    [otId, intervencionId, refetch],
  );

  const eliminarRepuesto = useCallback(
    async (id: string) => {
      await deleteRepuestoUtilizado(otId, intervencionId, id);
      await refetch();
    },
    [otId, intervencionId, refetch],
  );

  return {
    repuestosUtilizados,
    loading,
    error,
    empty: !loading && repuestosUtilizados.length === 0,
    refetch,
    agregarRepuesto,
    editarRepuesto,
    eliminarRepuesto,
  };
}
