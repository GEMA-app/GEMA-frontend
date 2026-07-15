'use client';

import { useCallback, useEffect, useState } from 'react';
import { createUsuario, deleteUsuario, getUsuarios } from '@/services/usuarios';
import type { Usuario, NuevoUsuarioInput } from '@/types/usuario';

interface UseUsuariosOptions {
  page?: number;
  perPage?: number;
  search?: string;
}

export function useUsuarios({ page = 1, perPage = 15, search = '' }: UseUsuariosOptions = {}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsuarios({ page, perPage, search: search || undefined });
      setUsuarios(res.usuarios);
      setTotal(res.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => { void fetch(); }, [fetch]);

  const refetch = useCallback(() => fetch(), [fetch]);

  const crearUsuario = useCallback(async (input: NuevoUsuarioInput) => {
    await createUsuario(input);
    await refetch();
  }, [refetch]);

  const eliminarUsuario = useCallback(async (id: string) => {
    await deleteUsuario(id);
    await refetch();
  }, [refetch]);

  return {
    usuarios, total, loading, error,
    empty: !loading && usuarios.length === 0,
    refetch, crearUsuario, eliminarUsuario,
  };
}
