'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createUsuario, deleteUsuario, getUsuarios } from '@/services/usuarios';
import type { Usuario, NuevoUsuarioInput } from '@/types/usuario';

interface UseUsuariosOptions {
  page?: number;
  perPage?: number;
  search?: string;
}

export function useUsuarios({ page = 1, perPage = 15, search = '' }: UseUsuariosOptions = {}) {
  const [all, setAll] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsuarios({});
      setAll(res.usuarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  const filtered = useMemo(() => {
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.some(r => r.toLowerCase().includes(q))
    );
  }, [all, search]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const usuarios = filtered.slice((page - 1) * perPage, page * perPage);

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
