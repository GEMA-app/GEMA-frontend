'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, Box, CheckCircle2, Wrench, XCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useActivos } from '@/hooks/useActivos';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { getArticulos } from '@/services/catalogo';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { formatEstadoActivo } from '@/lib/activos';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, type EstadoActivo } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import type { Activo, ActivoEstado } from '@/types/activo';

const PER_PAGE = 15;

const ESTADO_FILTER_OPTIONS: { value: ActivoEstado | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'operativo', label: 'Operativo' },
  { value: 'en_mantenimiento', label: 'En mantenimiento' },
  { value: 'fuera_de_servicio', label: 'Fuera de servicio' },
  { value: 'dado_de_baja', label: 'Dado de baja' },
];

interface Summary {
  total: number;
  operativo: number;
  enMantenimiento: number;
  fueraDeServicio: number;
}

export default function ActivosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<ActivoEstado | ''>('');
  const [page, setPage] = useState(1);

  const { activos, meta, loading, error, empty, eliminarActivo } = useActivos({
    search: debouncedSearch,
    estado: estadoFiltro || undefined,
    page,
    perPage: PER_PAGE,
  });

  const { ubicaciones } = useUbicaciones();

  const [articuloMap, setArticuloMap] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    getArticulos({ perPage: 200 })
      .then((articulos) => {
        if (cancelled) return;
        setArticuloMap(Object.fromEntries(articulos.map((a) => [a.id, a.name])));
      })
      .catch(() => {
        // ponytail: non-critical, fall back to showing serial only
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [summary, setSummary] = useState<Summary>({
    total: 0,
    operativo: 0,
    enMantenimiento: 0,
    fueraDeServicio: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        const empresaId = await requireEmpresaId();
        const base = `/v1/empresas/${empresaId}/activos`;
        const [totalRes, opRes, mantRes, fueraRes] = await Promise.all([
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=operativo`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=en_mantenimiento`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=fuera_de_servicio`),
        ]);
        if (cancelled) return;
        setSummary({
          total: totalRes.meta?.total ?? 0,
          operativo: opRes.meta?.total ?? 0,
          enMantenimiento: mantRes.meta?.total ?? 0,
          fueraDeServicio: fueraRes.meta?.total ?? 0,
        });
      } catch {
        // ponytail: non-critical, show 0
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [activos.length]);

  const ubicacionMap = useMemo(() => {
    const map: Record<string, string> = {};
    const walk = (items: Array<{ id: string; nombre: string; hijos?: unknown[] }>) => {
      for (const item of items) {
        map[item.id] = item.nombre;
        if (Array.isArray(item.hijos)) walk(item.hijos as typeof items);
      }
    };
    if (ubicaciones) walk(ubicaciones);
    return map;
  }, [ubicaciones]);

  const activosEnriquecidos: Activo[] = useMemo(
    () =>
      activos.map((a) => ({
        ...a,
        ubicacion: ubicacionMap[a.ubicacion] || a.ubicacion || 'N/A',
      })),
    [activos, ubicacionMap],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, codigoActivo: string) => {
      const { value } = await Swal.fire({
        title: '¿Eliminar activo?',
        text: 'Escribe el código del activo para confirmar',
        input: 'text',
        inputPlaceholder: 'Ej: ACT-001',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#EF4444',
        cancelButtonText: 'Cancelar',
      });
      if (value === undefined) return;
      if (value !== codigoActivo) {
        Swal.fire('Error', 'El código no coincide', 'error');
        return;
      }
      try {
        await eliminarActivo(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar el activo');
      }
    },
    [eliminarActivo],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron activos para "${debouncedSearch}".`
    : estadoFiltro
      ? `No hay activos con estado "${formatEstadoActivo(estadoFiltro)}".`
      : 'No hay activos registrados. Crea el primero con el botón "Nuevo activo".';

  const columns: DataTableColumn<Activo>[] = [
    {
      key: 'serial',
      header: 'Código',
      render: (activo) => <span className="font-semibold text-gema-primary dark:text-white">{activo.serial}</span>,
    },
    {
      key: 'nombre',
      header: 'Nombre / Artículo',
      render: (activo) => (
        <div>
          <p className="font-semibold text-gema-primary dark:text-white">{activo.nombre}</p>
          <p className="text-xs text-gema-primary/50 dark:text-white/40">
            {(activo.articuloId && articuloMap[activo.articuloId]) || 'Sin artículo asociado'}
          </p>
        </div>
      ),
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      render: (activo) => activo.ubicacion,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (activo) => <Badge estado={activo.estado as EstadoActivo} />,
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (activo) =>
        activo.valorMonetario != null
          ? `${activo.valorMonetario.toLocaleString('es-VE')} ${activo.moneda ?? 'USD'}`
          : '—',
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (activo) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/activos/${activo.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Ver ${activo.nombre}`}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <PermissionGuard module="activos" action="edit">
            <Link
              href={`/activos/${activo.id}/editar`}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Editar ${activo.nombre}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </PermissionGuard>
          <PermissionGuard module="activos" action="delete">
            <button
              type="button"
              onClick={() => handleDelete(activo.id, activo.serial)}
              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label={`Eliminar ${activo.nombre}`}
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
            Activos
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Inventario y seguimiento de equipos críticos
          </p>
        </div>
        <PermissionGuard module="activos" action="create">
          <Link
            href="/activos/nuevo"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo activo
          </Link>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Box} value={summary.total} label="Activos totales" loading={summaryLoading} tone="default" />
        <StatCard icon={CheckCircle2} value={summary.operativo} label="Operativos" loading={summaryLoading} tone="accent" />
        <StatCard icon={Wrench} value={summary.enMantenimiento} label="En mantenimiento" loading={summaryLoading} tone="accent" />
        <StatCard icon={XCircle} value={summary.fueraDeServicio} label="Fuera de servicio" loading={summaryLoading} tone="danger" />
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre..."
            aria-label="Buscar activos"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as ActivoEstado | '');
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
            data={activosEnriquecidos}
            keyExtractor={(activo) => activo.id}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}

        {!loading && !empty && meta.lastPage > 1 && (
          <nav
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
            aria-label="Paginación de activos"
          >
            <p>
              Página {meta.page} de {meta.lastPage} — {meta.total} activos
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
