'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { createUsuario, deleteUsuario, getUsuarios } from '@/services/usuarios';
import type { NuevoUsuarioInput, Usuario, UsuariosMeta } from '@/types/usuario';

const DEFAULT_META: UsuariosMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

export interface UseUsuariosOptions {
  page?: number;
  perPage?: number;
  search?: string;
}

export function useUsuarios({ page = 1, perPage = 15, search = '' }: UseUsuariosOptions = {}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [meta, setMeta] = useState<UsuariosMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getUsuarios({ page, perPage, search });
      setUsuarios(response.usuarios);
      setMeta(response.meta);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar la lista de usuarios.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  const refetch = useCallback(async () => {
    await fetchUsuarios();
  }, [fetchUsuarios]);

  const crearUsuario = useCallback(
    async (input: NuevoUsuarioInput) => {
      await createUsuario(input);
      await refetch();
    },
    [refetch],
  );

  const eliminarUsuario = useCallback(
    async (id: string) => {
      await deleteUsuario(id);
      await refetch();
    },
    [refetch],
  );

  return {
    usuarios,
    meta,
    loading,
    error,
    empty: !loading && usuarios.length === 0,
    refetch,
    crearUsuario,
    eliminarUsuario,
  };
}
