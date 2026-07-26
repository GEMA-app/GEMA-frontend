'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, Package, AlertCircle, XCircle, DollarSign } from 'lucide-react';
import { useRepuestos } from '@/hooks/useRepuestos';
import { getRepuestos } from '@/services/repuestos';
import { getArticulos as getArticulosCatalogo, type ArticuloCatalogo } from '@/services/catalogo';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, type EstadoRepuesto } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import type { Repuesto } from '@/types/repuesto';

const PER_PAGE = 15;

const ESTADO_FILTER_OPTIONS: { value: EstadoRepuesto | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'bajo_minimo', label: 'Bajo mínimo' },
  { value: 'sin_stock', label: 'Sin stock' },
];

interface Summary {
  total: number;
  bajoMinimo: number;
  sinStock: number;
  valorTotal: number;
}

export function getEstadoRepuesto(stockActual: number, stockMinimo: number): EstadoRepuesto {
  if (stockActual === 0) return 'sin_stock';
  if (stockActual <= stockMinimo) return 'bajo_minimo';
  return 'disponible';
}

export default function RepuestosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoRepuesto | ''>('');
  const [page, setPage] = useState(1);

  const { repuestos, meta, loading, error, empty, eliminarRepuesto } = useRepuestos({
    page,
    perPage: PER_PAGE,
  });

  const [articuloMap, setArticuloMap] = useState<Record<string, ArticuloCatalogo>>({});
  useEffect(() => {
    let cancelled = false;
    getArticulosCatalogo({ perPage: 200 })
      .then((articulos) => {
        if (cancelled) return;
        setArticuloMap(Object.fromEntries(articulos.map((a) => [a.id, a])));
      })
      .catch(() => {
        // non-critical fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [summary, setSummary] = useState<Summary>({
    total: 0,
    bajoMinimo: 0,
    sinStock: 0,
    valorTotal: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        const res = await getRepuestos({ page: 1, perPage: 500 });
        if (cancelled) return;
        const allRepuestos = res.repuestos;
        let bajoMin = 0;
        let sinStk = 0;
        let valTot = 0;

        for (const r of allRepuestos) {
          if (r.stock_actual === 0) {
            sinStk++;
          } else if (r.stock_actual <= r.stock_minimo) {
            bajoMin++;
          }
          valTot += (r.stock_actual || 0) * (r.precio_unitario || 0);
        }

        setSummary({
          total: res.meta?.total ?? allRepuestos.length,
          bajoMinimo: bajoMin,
          sinStock: sinStk,
          valorTotal: valTot,
        });
      } catch {
        // non-critical, show 0
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [repuestos.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      if (!window.confirm(`¿Eliminar el repuesto "${nombre}"? Esta acción no se puede deshacer.`)) return;
      try {
        await eliminarRepuesto(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar el repuesto');
      }
    },
    [eliminarRepuesto],
  );

  const repuestosFiltrados = useMemo(() => {
    return repuestos.filter((r) => {
      const art = articuloMap[r.articulo_id];
      const nombre = art?.name || r.articulo_id;
      const searchMatch =
        !debouncedSearch ||
        nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.articulo_id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.ubicacion_almacen && r.ubicacion_almacen.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const est = getEstadoRepuesto(r.stock_actual, r.stock_minimo);
      const estadoMatch = !estadoFiltro || est === estadoFiltro;

      return searchMatch && estadoMatch;
    });
  }, [repuestos, articuloMap, debouncedSearch, estadoFiltro]);

  const emptyMessage = debouncedSearch
    ? `No se encontraron repuestos para "${debouncedSearch}".`
    : estadoFiltro
      ? `No hay repuestos con estado "${estadoFiltro}".`
      : 'No hay repuestos registrados. Crea el primero con el botón "Nuevo repuesto".';

  const columns: DataTableColumn<Repuesto>[] = [
    {
      key: 'codigo',
      header: 'Código',
      render: (repuesto) => (
        <span className="font-semibold text-gema-primary dark:text-white">
          {articuloMap[repuesto.articulo_id]?.model || repuesto.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (repuesto) => {
        const art = articuloMap[repuesto.articulo_id];
        return (
          <div>
            <p className="font-semibold text-gema-primary dark:text-white">
              {art?.name || repuesto.articulo_id}
            </p>
            <p className="text-xs text-gema-primary/50 dark:text-white/40">
              {repuesto.ubicacion_almacen ? `Almacén: ${repuesto.ubicacion_almacen}` : 'Sin ubicación'}
            </p>
          </div>
        );
      },
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (repuesto) => {
        const art = articuloMap[repuesto.articulo_id];
        return (
          <span className="text-gema-primary/80 dark:text-white/80">
            {art?.category_id || art?.manufacturer || 'General'}
          </span>
        );
      },
    },
    {
      key: 'stock_actual',
      header: 'Stock actual',
      render: (repuesto) => (
        <span className="font-semibold text-gema-primary dark:text-white">
          {repuesto.stock_actual}
        </span>
      ),
    },
    {
      key: 'stock_minimo',
      header: 'Stock mínimo',
      render: (repuesto) => (
        <span className="text-gema-primary/70 dark:text-white/60">
          {repuesto.stock_minimo}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (repuesto) => {
        const est = getEstadoRepuesto(repuesto.stock_actual, repuesto.stock_minimo);
        return <Badge estado={est} />;
      },
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (repuesto) => {
        const art = articuloMap[repuesto.articulo_id];
        const nombre = art?.name || repuesto.articulo_id;
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/repuestos/${repuesto.id}`}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Ver ${nombre}`}
            >
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <Link
              href={`/repuestos/${repuesto.id}/editar`}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Editar ${nombre}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(repuesto.id, nombre)}
              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label={`Eliminar ${nombre}`}
            >
              <Trash className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Inventario de repuestos
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Control de stock, partes y consumibles
          </p>
        </div>
        <Link
          href="/repuestos/nuevo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo repuesto
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Package} value={summary.total} label="Total repuestos" loading={summaryLoading} tone="default" />
        <StatCard icon={AlertCircle} value={summary.bajoMinimo} label="Stock bajo mínimo" loading={summaryLoading} tone="accent" />
        <StatCard icon={XCircle} value={summary.sinStock} label="Sin stock" loading={summaryLoading} tone="danger" />
        <StatCard
          icon={DollarSign}
          value={`$ ${summary.valorTotal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          label="Valor total inventario"
          loading={summaryLoading}
          tone="accent"
        />
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre o almacén..."
            aria-label="Buscar repuestos"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoRepuesto | '');
              setPage(1);
            }}
            aria-label="Filtrar por estado"
            className="px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent sm:w-56"
          >
            {ESTADO_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && empty ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={repuestosFiltrados}
            keyExtractor={(repuesto) => repuesto.id}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}

        {!loading && !empty && meta.lastPage > 1 && (
          <nav
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
            aria-label="Paginación de repuestos"
          >
            <p>
              Página {meta.page} de {meta.lastPage} — {meta.total} repuestos
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
