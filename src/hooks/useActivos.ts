'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { normalizeAssetStatus } from '@/lib/activos';
import {
  createActivo,
  deleteActivo,
  getActivo,
  getActivos,
  getCatalogArticle,
  getHistorialEstadosActivo,
  updateActivo,
} from '@/services/activos';
import { createArticulo, deleteArticulo, getArticulos } from '@/services/catalogo';
import type {
  Activo,
  ActivoEstado,
  ActivoResponse,
  ActivosQuery,
  CatalogArticleResponse,
  LogEstadoActivo,
} from '@/types/activo';
import type { PaginationMeta } from '@/types/common';

const DEFAULT_META: PaginationMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

export interface UseActivosOptions {
  search?: string;
  estado?: ActivoEstado;
  ubicacionId?: string;
  page?: number;
  perPage?: number;
}

export function useActivos({
  search = '',
  estado,
  ubicacionId,
  page = 1,
  perPage = 15,
}: UseActivosOptions = {}) {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query: ActivosQuery = {
      page,
      perPage,
      search: search || undefined,
      estado,
      ubicacionId: ubicacionId || undefined,
    };

    try {
      const response = await getActivos(query);
      setActivos(response.activos);
      setMeta(response.meta);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los activos.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, estado, ubicacionId]);

  useEffect(() => {
    void fetchActivos();
  }, [fetchActivos]);

  const refetch = useCallback(async () => {
    await fetchActivos();
  }, [fetchActivos]);

  const crearActivo = useCallback(
    async (data: {
      nombre: string;
      codigo: string;
      marca?: string;
      ubicacion?: string;
      fechaCompra?: string;
      valorMonetario?: string;
      moneda?: string;
      estadoInicial: string;
    }) => {
      // Resolver artículo de catálogo (buscar existente o crear uno nuevo)
      const existentes = await getArticulos({ search: data.nombre, perPage: 1 });
      let articuloId: string;
      let articuloCreado = false;

      if (existentes.length > 0) {
        articuloId = existentes[0].id;
      } else {
        const nuevo = await createArticulo({
          name: data.nombre,
          manufacturer: data.marca || undefined,
          model: data.nombre,
        });
        articuloId = nuevo.id;
        articuloCreado = true;
      }

      const valor = data.valorMonetario ? parseFloat(data.valorMonetario.replace(',', '.')) : null;

      try {
        await createActivo({
          articulo_id: articuloId,
          serial_interno: data.nombre,
          codigo_activo: data.codigo,
          estado: normalizeAssetStatus(data.estadoInicial),
          ubicacion_id: data.ubicacion || null,
          fecha_adquisicion: data.fechaCompra || null,
          valor_monetario: valor,
          moneda: data.moneda || 'USD',
        });
      } catch (err) {
        // ponytail: rollback parcial, artículo huérfano si deleteArticulo falla
        if (articuloCreado) {
          try { await deleteArticulo(articuloId); } catch { console.error('Rollback: no se pudo eliminar artículo huérfano'); }
        }
        throw err;
      }

      await refetch();
    },
    [refetch],
  );

  const editarActivo = useCallback(
    async (id: string, data: Partial<{
      serial_interno: string;
      codigo_activo: string;
      ubicacion_id: string | null;
      fecha_adquisicion: string | null;
      estado: string;
      valor_monetario: number | null;
      moneda: string;
    }> & { version: number }) => {
      await updateActivo(id, data);
      await refetch();
    },
    [refetch],
  );

  const eliminarActivo = useCallback(
    async (id: string) => {
      await deleteActivo(id);
      await refetch();
    },
    [refetch],
  );

  return {
    activos,
    meta,
    loading,
    error,
    empty: !loading && activos.length === 0,
    refetch,
    crearActivo,
    editarActivo,
    eliminarActivo,
  };
}

export function useActivo(id: string) {
  const [activo, setActivo] = useState<ActivoResponse | null>(null);
  const [catalog, setCatalog] = useState<CatalogArticleResponse | null>(null);
  const [historial, setHistorial] = useState<LogEstadoActivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const a = await getActivo(id);
      setActivo(a);
      const [c, h] = await Promise.all([
        getCatalogArticle(a.articulo_id).catch(() => null),
        getHistorialEstadosActivo(id).catch(() => []),
      ]);
      setCatalog(c);
      setHistorial(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar activo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDetalle();
  }, [fetchDetalle]);

  return {
    activo,
    catalog,
    historial,
    loading,
    error,
    refetch: fetchDetalle,
  };
}
