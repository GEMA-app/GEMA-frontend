'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  createProveedor,
  deleteProveedor,
  getProveedores,
  updateProveedor,
} from '@/services/proveedores';
import type {
  CreateProveedorForm,
  Proveedor,
  ProveedoresQuery,
  UpdateProveedorForm,
} from '@/types/proveedor';

export function useProveedores({ search = '' }: ProveedoresQuery = {}) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProveedores({ search: search || undefined });
      setProveedores(response.proveedores);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudieron cargar los proveedores.',
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void fetchProveedores(); }, [fetchProveedores]);

  const refetch = useCallback(async () => { await fetchProveedores(); }, [fetchProveedores]);

  const crearProveedor = useCallback(async (data: CreateProveedorForm) => {
    const result = await createProveedor(data);
    await refetch();
    return result;
  }, [refetch]);

  const editarProveedor = useCallback(async (id: string, data: UpdateProveedorForm) => {
    const result = await updateProveedor(id, data);
    await refetch();
    return result;
  }, [refetch]);

  const eliminarProveedor = useCallback(async (id: string) => {
    await deleteProveedor(id);
    await refetch();
  }, [refetch]);

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