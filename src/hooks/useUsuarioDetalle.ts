'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  deleteUsuario,
  getUsuarioById,
  updateUsuario,
} from '@/services/usuarios';
import type { ActualizarUsuarioInput, UsuarioDetalle } from '@/types/usuario';

export function useUsuarioDetalle(id: string) {
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuario = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detalle = await getUsuarioById(id);
      setUsuario(detalle);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el detalle del usuario.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchUsuario();
  }, [fetchUsuario]);

  const refetch = useCallback(async () => {
    await fetchUsuario();
  }, [fetchUsuario]);

  const actualizarUsuario = useCallback(
    async (input: ActualizarUsuarioInput) => {
      const detalle = await updateUsuario(id, input);
      setUsuario(detalle);
    },
    [id],
  );

  const eliminarUsuario = useCallback(async () => {
    await deleteUsuario(id);
  }, [id]);

  return {
    usuario,
    loading,
    error,
    refetch,
    actualizarUsuario,
    eliminarUsuario,
  };
}
