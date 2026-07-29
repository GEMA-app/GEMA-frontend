'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createProveedor,
  deleteProveedor,
  getProveedores,
  updateProveedor,
} from '@/services/proveedores';
import type { CreateProveedorForm, Proveedor, ProveedoresQuery, UpdateProveedorForm } from '@/types/proveedor';

export function useProveedores({ search = '', incluir_inactivos }: ProveedoresQuery = {}) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProveedores({
        search: search || undefined,
        incluir_inactivos,
      });
      setProveedores(response.proveedores);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudieron cargar los proveedores.',
      );
    } finally {
      setLoading(false);
    }
  }, [search, incluir_inactivos]);

  useEffect(() => {
    void fetchProveedores();
  }, [fetchProveedores]);

  const refetch = useCallback(async () => {
    await fetchProveedores();
  }, [fetchProveedores]);

  const crearProveedor = useCallback(
    async (data: CreateProveedorForm) => {
      await createProveedor(data);
      await refetch();
    },
    [refetch],
  );

  const editarProveedor = useCallback(
    async (id: string, data: UpdateProveedorForm) => {
      await updateProveedor(id, data);
      await refetch();
    },
    [refetch],
  );

  const eliminarProveedor = useCallback(
    async (id: string) => {
      await deleteProveedor(id);
      await refetch();
    },
    [refetch],
  );

  return {
    proveedores,
    loading,
    error,
    empty: !loading && proveedores.length === 0,
    refetch,
    crearProveedor,
    editarProveedor,
    eliminarProveedor,
  };
}
