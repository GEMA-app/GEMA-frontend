'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash, Package, FolderTree, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getArticulosPage, getCategorias, deleteArticulo, type CategoriaCatalogo } from '@/services/catalogo';
import { ApiError } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import type { ArticuloCatalogo } from '@/services/catalogo';
import type { PaginationMeta } from '@/types/common';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Select } from '@/components/ui/Select';

const PER_PAGE = 15;
const EMPTY_META: PaginationMeta = { page: 1, perPage: PER_PAGE, total: 0, lastPage: 1 };

export default function CatalogoPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [page, setPage] = useState(1);

  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const categoriaMap = useMemo(
    () => new Map(categorias.map((c) => [c.id, c.name])),
    [categorias],
  );

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch(() => {
        // no bloquea el listado principal
      });
  }, []);

  const loadArticulos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta: pageMeta } = await getArticulosPage({
        page,
        perPage: PER_PAGE,
        category_id: categoriaFiltro || undefined,
        search: debouncedSearch || undefined,
      });
      setArticulos(data);
      setMeta(pageMeta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los artículos.');
    } finally {
      setLoading(false);
    }
  }, [page, categoriaFiltro, debouncedSearch]);

  useEffect(() => {
    loadArticulos();
  }, [loadArticulos]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      const { value } = await Swal.fire({
        title: '¿Eliminar artículo?',
        text: `Escribe "${nombre}" para confirmar`,
        input: 'text',
        inputPlaceholder: nombre,
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#EF4444',
        cancelButtonText: 'Cancelar',
      });
      if (value === undefined) return;
      if (value?.trim().toLowerCase() !== nombre.trim().toLowerCase()) {
        Swal.fire('Error', 'El nombre no coincide', 'error');
        return;
      }
      try {
        await deleteArticulo(id);
        loadArticulos();
      } catch (err) {
        const is409 = err instanceof ApiError && err.status === 409;
        const msg = is409
          ? 'No se puede eliminar el artículo porque está asociado a activos u órdenes existentes.'
          : err instanceof ApiError
            ? err.message
            : 'Error al eliminar el artículo.';
        Swal.fire('Error', msg, 'error');
      }
    },
    [loadArticulos],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron artículos para "${debouncedSearch}".`
    : categoriaFiltro
      ? 'No hay artículos en esta categoría.'
      : 'No hay artículos registrados. Crea el primero con el botón "Nuevo artículo".';

  const columns: DataTableColumn<ArticuloCatalogo>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (articulo) => <span className="font-semibold text-gema-primary dark:text-white">{articulo.name}</span>,
    },
    {
      key: 'manufacturer',
      header: 'Fabricante',
      render: (articulo) => articulo.manufacturer || '—',
    },
    {
      key: 'model',
      header: 'Modelo',
      render: (articulo) => articulo.model || '—',
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (articulo) =>
        articulo.category_id ? (
          <Badge estado="activos" label={categoriaMap.get(articulo.category_id) || 'Sin categoría'} />
        ) : (
          <span className="text-gema-primary/50 dark:text-white/40">Sin categoría</span>
        ),
    },
    {
      key: 'unit_of_measure',
      header: 'Unidad de medida',
      render: (articulo) => articulo.unit_of_measure || '—',
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (articulo) => (
        <div className="flex items-center justify-end gap-2">
          <PermissionGuard module="administracion" action="edit">
            <Link
              href={`/catalogo/${articulo.id}/editar`}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Editar ${articulo.name}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </PermissionGuard>
          <PermissionGuard module="administracion" action="delete">
            <button
              type="button"
              onClick={() => handleDelete(articulo.id, articulo.name)}
              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label={`Eliminar ${articulo.name}`}
            >
              <Trash className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Catálogo
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Artículos y categorías del catálogo maestro
          </p>
        </div>
        <PermissionGuard module="administracion" action="create">
          <Link
            href="/catalogo/nuevo"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo artículo
          </Link>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Package} value={meta.total} label="Artículos totales" loading={loading} tone="default" />
        <StatCard icon={FolderTree} value={categorias.length} label="Categorías" tone="accent" />
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar artículos"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
          <Select
            value={categoriaFiltro}
            onChange={(value) => {
              setCategoriaFiltro(value);
              setPage(1);
            }}
            aria-label="Filtrar por categoría"
            options={[
              { value: '', label: 'Todas las categorías' },
              ...categorias.map((categoria) => ({ value: categoria.id, label: categoria.name })),
            ]}
            className="sm:w-56"
          />
          <Link
            href="/catalogo/categorias"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gema-primary dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            Ver categorías
          </Link>
        </div>

        {error && articulos.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={articulos}
            keyExtractor={(articulo) => articulo.id}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}

        {!loading && articulos.length > 0 && meta.lastPage > 1 && (
          <nav
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
            aria-label="Paginación de artículos"
          >
            <p>
              Página {meta.page} de {meta.lastPage} — {meta.total} artículos
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark-2 px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.lastPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark-2 px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
