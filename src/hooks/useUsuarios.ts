'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createUsuario, deleteUsuario, getUsuarios, updateUsuario } from '@/services/usuarios';
import type { Usuario, NuevoUsuarioInput, ActualizarUsuarioInput } from '@/types/usuario';

interface UseUsuariosOptions {
  page?: number;
  perPage?: number;
  search?: string;
  estado?: 'activo' | 'inactivo' | '';
}

export function useUsuarios({ page = 1, perPage = 15, search = '', estado = '' }: UseUsuariosOptions = {}) {
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
    let result = all;
    if (estado) {
      const isActivoTarget = estado === 'activo';
      result = result.filter(u => u.activo === isActivoTarget);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roles.some(r => r.toLowerCase().includes(q))
      );
    }
    return result;
  }, [all, search, estado]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const usuarios = filtered.slice((page - 1) * perPage, page * perPage);

  const refetch = useCallback(() => fetch(), [fetch]);

  const crearUsuario = useCallback(async (input: NuevoUsuarioInput) => {
    await createUsuario(input);
    await refetch();
  }, [refetch]);

  const actualizarUsuario = useCallback(async (id: string, input: ActualizarUsuarioInput) => {
    await updateUsuario(id, input);
    await refetch();
  }, [refetch]);

  const eliminarUsuario = useCallback(async (id: string) => {
    await deleteUsuario(id);
    await refetch();
  }, [refetch]);

  return {
    allUsuarios: all,
    usuarios,
    total,
    meta: {
      page,
      lastPage,
      total,
    },
    loading,
    error,
    empty: !loading && usuarios.length === 0,
    refetch,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
  };
}



