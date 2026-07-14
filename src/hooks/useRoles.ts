'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getRoles, createRol, updateRol, deleteRol } from '@/services/roles';
import type { Rol, NuevoRolInput, ActualizarRolInput } from '@/types/rol';

export function useRoles() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los roles.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const refetch = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  const crearRol = useCallback(
    async (input: NuevoRolInput) => {
      await createRol(input);
      await refetch();
    },
    [refetch],
  );

  const editarRol = useCallback(
    async (id: string, input: ActualizarRolInput) => {
      await updateRol(id, input);
      await refetch();
    },
    [refetch],
  );

  const eliminarRol = useCallback(
    async (id: string) => {
      await deleteRol(id);
      await refetch();
    },
    [refetch],
  );

  return {
    roles,
    loading,
    error,
    empty: !loading && roles.length === 0,
    refetch,
    crearRol,
    editarRol,
    eliminarRol,
  };
}
