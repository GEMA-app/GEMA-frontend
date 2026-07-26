'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createUbicacion as createUbicacionRequest,
  deleteUbicacion as deleteUbicacionRequest,
  getUbicaciones,
  updateUbicacion as updateUbicacionRequest,
} from '@/services/ubicaciones';
import type { ActualizarUbicacionForm, NuevaUbicacionForm, Ubicacion } from '@/types/ubicacion';

export function useUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUbicaciones();
      setUbicaciones(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar las ubicaciones.';
      setError(message);
      setUbicaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createUbicacion = useCallback(
    async (data: NuevaUbicacionForm) => {
      setIsMutating(true);
      setError(null);

      try {
        await createUbicacionRequest(data);
        await refetch();
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo crear la ubicación.';
        setError(message);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refetch],
  );

  const updateUbicacion = useCallback(
    async (id: string, data: Partial<ActualizarUbicacionForm>) => {
      setIsMutating(true);
      setError(null);

      try {
        await updateUbicacionRequest(id, data);
        await refetch();
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar la ubicación.';
        setError(message);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refetch],
  );

  const deleteUbicacion = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setError(null);

      try {
        await deleteUbicacionRequest(id);
        await refetch();
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo eliminar la ubicación.';
        setError(message);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refetch],
  );

  return {
    ubicaciones,
    loading,
    error,
    empty: !loading && !error && ubicaciones.length === 0,
    isMutating,
    refetch,
    createUbicacion,
    updateUbicacion,
    deleteUbicacion,
  };
}

