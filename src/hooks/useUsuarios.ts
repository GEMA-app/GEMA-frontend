'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getMockUsuarios } from '@/data/mockUsuarios';
import { formatEstado, formatRol, getIniciales } from '@/lib/usuarios';
import { createUsuario, deleteUsuario, getUsuarios } from '@/services/usuarios';
import type { NuevoUsuarioInput, Usuario, UsuariosMeta } from '@/types/usuario';

const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_USUARIOS === 'true';

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
      if (USE_MOCK) {
        const mock = getMockUsuarios(page, perPage, search);
        setUsuarios(mock.usuarios);
        setMeta({
          page,
          perPage,
          total: mock.total,
          lastPage: mock.lastPage,
        });
        return;
      }

      const response = await getUsuarios({ page, perPage, search });
      setUsuarios(response.usuarios);
      setMeta(response.meta);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar la lista de usuarios.';

      if (!USE_MOCK) {
        const mock = getMockUsuarios(page, perPage, search);
        setUsuarios(mock.usuarios);
        setMeta({
          page,
          perPage,
          total: mock.total,
          lastPage: mock.lastPage,
        });
        setError(message);
      } else {
        setUsuarios([]);
        setMeta(DEFAULT_META);
        setError(message);
      }
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
      if (USE_MOCK) {
        const nuevo: Usuario = {
          id: String(Date.now()),
          iniciales: getIniciales(input.nombre),
          nombre: input.nombre,
          email: input.email,
          rol: formatRol(input.rol),
          departamento: 'N/A',
          activo: input.estado === 'activo',
        };
        setUsuarios((current) => [nuevo, ...current]);
        setMeta((current) => ({
          ...current,
          total: current.total + 1,
        }));
        return;
      }
      await createUsuario(input);
      await refetch();
    },
    [refetch],
  );

  const eliminarUsuario = useCallback(
    async (id: string) => {
      if (USE_MOCK) {
        setUsuarios((current) => current.filter((usuario) => usuario.id !== id));
        return;
      }
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
    isMock: USE_MOCK,
  };
}
