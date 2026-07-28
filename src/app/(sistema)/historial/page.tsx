'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, History, Clock, Users, ShieldAlert, AlertCircle, RotateCcw } from 'lucide-react';
import { useHistorial } from '@/hooks/useHistorial';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, type EstadoBadgeType } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import type { HistorialEntry } from '@/types/historial';

const PER_PAGE = 15;

const MODULO_FILTER_OPTIONS = [
  { value: '', label: 'Todos los módulos' },
  { value: 'activos', label: 'Activos' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'usuarios', label: 'Usuarios' },
  { value: 'sistema', label: 'Sistema' },
];

function formatFechaHora(fechaStr: string) {
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return { fecha: fechaStr, hora: '—' };
    const fecha = d.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const hora = d.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { fecha, hora };
  } catch {
    return { fecha: fechaStr, hora: '—' };
  }
}

export default function HistorialPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { entries, meta, loading, error, empty } = useHistorial({
    search: debouncedSearch || undefined,
    modulo: moduloFiltro || undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    page,
    limit: PER_PAGE,
  });

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (moduloFiltro && (entry.modulo ?? 'sistema').toLowerCase() !== moduloFiltro.toLowerCase()) {
        return false;
      }
      if (usuarioFiltro) {
        const u = usuarioFiltro.toLowerCase();
        const matchesUser =
          entry.usuario.nombre.toLowerCase().includes(u) ||
          (entry.usuario.email && entry.usuario.email.toLowerCase().includes(u));
        if (!matchesUser) return false;
      }
      if (fechaDesde) {
        const entryTime = new Date(entry.fecha).getTime();
        const startTime = new Date(`${fechaDesde}T00:00:00`).getTime();
        if (entryTime < startTime) return false;
      }
      if (fechaHasta) {
        const entryTime = new Date(entry.fecha).getTime();
        const endTime = new Date(`${fechaHasta}T23:59:59`).getTime();
        if (entryTime > endTime) return false;
      }
      return true;
    });
  }, [entries, moduloFiltro, usuarioFiltro, fechaDesde, fechaHasta]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  }, [filteredEntries]);

  const summary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let hoy = 0;
    const uniqueUsers = new Set<string>();
    let criticas = 0;

    entries.forEach((entry) => {
      if (entry.fecha.startsWith(todayStr)) {
        hoy++;
      }
      if (entry.usuario.nombre) {
        uniqueUsers.add(entry.usuario.nombre);
      }
      const acc = entry.accion.toLowerCase();
      const desc = (entry.descripcion ?? '').toLowerCase();
      if (
        acc.includes('eliminar') ||
        acc.includes('baja') ||
        acc.includes('cancel') ||
        acc.includes('desactivar') ||
        acc.includes('critica') ||
        desc.includes('eliminar') ||
        desc.includes('baja') ||
        desc.includes('error')
      ) {
        criticas++;
      }
    });

    return {
      total: meta.total || entries.length,
      hoy,
      usuariosActivos: uniqueUsers.size,
      accionesCriticas: criticas,
    };
  }, [entries, meta.total]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(moduloFiltro) ||
    Boolean(usuarioFiltro) ||
    Boolean(fechaDesde) ||
    Boolean(fechaHasta);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setModuloFiltro('');
    setUsuarioFiltro('');
    setFechaDesde('');
    setFechaHasta('');
    setPage(1);
  };

  const emptyMessage = debouncedSearch
    ? `No se encontraron eventos para "${debouncedSearch}".`
    : hasActiveFilters
      ? 'No hay registros que coincidan con los filtros seleccionados.'
      : 'No hay eventos de auditoría registrados.';

  const columns: DataTableColumn<HistorialEntry>[] = [
    {
      key: 'fecha',
      header: 'Fecha / Hora',
      render: (entry) => {
        const { fecha, hora } = formatFechaHora(entry.fecha);
        return (
          <div>
            <p className="font-semibold text-gema-primary dark:text-white">{fecha}</p>
            <p className="text-xs text-gema-primary/50 dark:text-white/40">{hora}</p>
          </div>
        );
      },
    },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (entry) => (
        <div>
          <p className="font-semibold text-gema-primary dark:text-white">{entry.usuario.nombre}</p>
          {entry.usuario.email && (
            <p className="text-xs text-gema-primary/50 dark:text-white/40">{entry.usuario.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'accion',
      header: 'Acción',
      render: (entry) => (
        <span className="font-medium text-gema-primary dark:text-white capitalize">
          {entry.accion.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'modulo',
      header: 'Módulo',
      render: (entry) => {
        const mod = (entry.modulo ?? 'sistema').toLowerCase() as EstadoBadgeType;
        return <Badge estado={mod} />;
      },
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (entry) => (
        <span className="text-sm text-gema-primary/80 dark:text-white/80 line-clamp-2">
          {entry.descripcion || entry.accion.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      render: (entry) => (
        <span className="font-mono text-xs text-gema-primary/60 dark:text-white/50">
          {entry.ip || '—'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (entry) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/historial/${entry.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Ver detalle del evento ${entry.id}`}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard module="administracion" action="view">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
              Historial
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
              Registro de auditoría y actividades del sistema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard icon={History} value={summary.total} label="Total eventos" loading={loading} tone="default" />
          <StatCard icon={Clock} value={summary.hoy} label="Eventos hoy" loading={loading} tone="accent" />
          <StatCard icon={Users} value={summary.usuariosActivos} label="Usuarios activos" loading={loading} tone="accent" />
          <StatCard icon={ShieldAlert} value={summary.accionesCriticas} label="Acciones críticas" loading={loading} tone="danger" />
        </div>

        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuario, acción o descripción..."
              aria-label="Buscar eventos"
              className="px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
            />
            <select
              value={moduloFiltro}
              onChange={(e) => {
                setModuloFiltro(e.target.value);
                setPage(1);
              }}
              aria-label="Filtrar por módulo"
              className="px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent"
            >
              {MODULO_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={usuarioFiltro}
              onChange={(e) => {
                setUsuarioFiltro(e.target.value);
                setPage(1);
              }}
              placeholder="Filtrar por usuario..."
              aria-label="Filtrar por usuario"
              className="px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
            />
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPage(1);
              }}
              aria-label="Fecha desde"
              className="px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setPage(1);
                }}
                aria-label="Fecha hasta"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent"
              />
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  title="Limpiar filtros"
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gema-primary/60 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {error && empty ? (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={sortedEntries}
              keyExtractor={(entry) => entry.id}
              loading={loading}
              emptyMessage={emptyMessage}
            />
          )}

          {!loading && !empty && meta.lastPage > 1 && (
            <nav
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
              aria-label="Paginación de historial"
            >
              <p>
                Página {meta.page} de {meta.lastPage} — {meta.total} registros
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
    </PermissionGuard>
  );
}
