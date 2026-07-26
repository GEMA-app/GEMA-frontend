'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  asignarTecnicoOT,
  cambiarEstadoOT,
  getHistorialEstadosOT,
  getOrdenTrabajoById,
  removerTecnicoOT,
  validarOrdenTrabajo,
} from '@/services/ordenes-trabajo';
import type { CambiarEstadoOTInput, HistorialEstadoOT, OrdenTrabajo } from '@/types/orden-trabajo';

export function useOrdenDetalle(id: string) {
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null);
  const [historial, setHistorial] = useState<HistorialEstadoOT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrden = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [o, h] = await Promise.all([
        getOrdenTrabajoById(id),
        getHistorialEstadosOT(id).catch(() => [] as HistorialEstadoOT[]),
      ]);
      setOrden(o);
      setHistorial(h);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar la orden de trabajo.');
      setOrden(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchOrden(); }, [fetchOrden]);

  const cambiarEstado = useCallback(async (input: CambiarEstadoOTInput): Promise<OrdenTrabajo | null> => {
    if (!orden) throw new Error('Orden no cargada');
    const updated = await cambiarEstadoOT(orden.id, input);
    setOrden(updated);
    return updated;
  }, [orden]);

  const asignar = useCallback(async (tecnicoId: string): Promise<void> => {
    if (!orden) throw new Error('Orden no cargada');
    await asignarTecnicoOT(orden.id, { tecnico_id: tecnicoId });
    await fetchOrden();
  }, [orden, fetchOrden]);

  const remover = useCallback(async (tecnicoId: string): Promise<void> => {
    if (!orden) throw new Error('Orden no cargada');
    await removerTecnicoOT(orden.id, tecnicoId);
    await fetchOrden();
  }, [orden, fetchOrden]);

  const validar = useCallback(async (): Promise<OrdenTrabajo | null> => {
    if (!orden) throw new Error('Orden no cargada');
    const updated = await validarOrdenTrabajo(orden.id);
    setOrden(updated);
    return updated;
  }, [orden]);

  const refetch = useCallback(async () => { await fetchOrden(); }, [fetchOrden]);

  return {
    orden, historial, loading, error,
    empty: !loading && !error && !orden,
    cambiarEstado, asignar, remover, validar, refetch,
  };
}
