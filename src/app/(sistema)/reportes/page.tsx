'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Pencil,
  Trash,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useReportes } from '@/hooks/useReportes';
import { getActivos } from '@/services/activos';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { CrearReporteModal } from '@/components/reportes/CrearReporteModal';
import { CambiarEstadoModal } from '@/components/reportes/CambiarEstadoModal';
import type { Reporte, ReporteEstado, ReportePrioridad } from '@/types/reporte';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const PER_PAGE = 15;

const ESTADO_FILTER_OPTIONS: { value: ReporteEstado | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'atendido', label: 'Atendido' },
  { value: 'descartado', label: 'Descartado' },
];

const PRIORIDAD_FILTER_OPTIONS: { value: ReportePrioridad | ''; label: string }[] = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
  { value: 'critica', label: 'Crítica' },
];

interface Summary {
  total: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
}

interface ReporteEnriquecido extends Reporte {
  activoNombre: string;
  activoCodigo: string | null;
}

export default function ReportesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<ReporteEstado | ''>('');
  const [prioridadFiltro, setPrioridadFiltro] = useState<ReportePrioridad | ''>('');
  const [page, setPage] = useState(1);

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const { reportes, meta, loading, error, empty, crearReporte, editarReporte, eliminarReporte } =
    useReportes({
      search: debouncedSearch,
      status: estadoFiltro || undefined,
      priority: prioridadFiltro || undefined,
      page,
      perPage: PER_PAGE,
    });

  const [activoMap, setActivoMap] = useState<Record<string, { nombre: string; serial: string }>>({});
  useEffect(() => {
    let cancelled = false;
    getActivos({ perPage: 200 })
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, { nombre: string; serial: string }> = {};
        for (const a of res.activos) {
          map[a.id] = { nombre: a.nombre, serial: a.serial };
        }
        setActivoMap(map);
      })
      .catch(() => {
        // non-critical
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [summary, setSummary] = useState<Summary>({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        const empresaId = await requireEmpresaId();
        const base = `/v1/empresas/${empresaId}/reportes-fallas`;
        const [totalRes, penRes, procRes, resRes, atRes] = await Promise.all([
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&status=pendiente`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&status=en_proceso`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&status=resuelto`).catch(() => ({ meta: { total: 0 } })),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&status=atendido`).catch(() => ({ meta: { total: 0 } })),
        ]);
        if (cancelled) return;
        const totalResueltos = (resRes.meta?.total ?? 0) + (atRes.meta?.total ?? 0);
        setSummary({
          total: totalRes.meta?.total ?? 0,
          pendientes: penRes.meta?.total ?? 0,
          enProceso: procRes.meta?.total ?? 0,
          resueltos: totalResueltos,
        });
      } catch {
        // fall back gracefully
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [reportes.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const reportesEnriquecidos: ReporteEnriquecido[] = useMemo(() => {
    return reportes.map((r) => {
      const act = r.activo_id ? activoMap[r.activo_id] : null;
      return {
        ...r,
        activoNombre: act?.nombre || r.location || 'Sin activo',
        activoCodigo: act?.serial || null,
      };
    });
  }, [reportes, activoMap]);

  const handleCreate = useCallback(
    async (input: Parameters<typeof crearReporte>[0]) => {
      setSaving(true);
      try {
        await crearReporte(input);
      } finally {
        setSaving(false);
      }
    },
    [crearReporte],
  );

  const handleUpdateStatus = useCallback(
    async (nuevoEstado: ReporteEstado) => {
      if (!selectedReporte) return;
      setCambiandoEstado(true);
      try {
        await editarReporte(selectedReporte.id, {
          status: nuevoEstado,
          version: selectedReporte.version,
        });
        setModalEstadoOpen(false);
        setSelectedReporte(null);
      } catch (err) {
        Swal.fire('Error', err instanceof Error ? err.message : 'Error al actualizar estado del reporte', 'error');
      } finally {
        setCambiandoEstado(false);
      }
    },
    [selectedReporte, editarReporte],
  );

  const handleDelete = useCallback(
    async (id: string, codigo: string) => {
      const result = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: `¿Eliminar el reporte "${codigo}"? Esta acción no se puede deshacer.`,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
      });
      if (!result.isConfirmed) return;
      try {
        await eliminarReporte(id);
      } catch (err) {
        Swal.fire('Error', err instanceof Error ? err.message : 'Error al eliminar el reporte', 'error');
      }
    },
    [eliminarReporte],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron reportes para "${debouncedSearch}".`
    : estadoFiltro || prioridadFiltro
      ? 'No hay reportes que coincidan con los filtros seleccionados.'
      : 'No hay reportes registrados. Registra el primero con el botón "Nuevo reporte".';

  const columns: DataTableColumn<ReporteEnriquecido>[] = [
    {
      key: 'codigo',
      header: 'Código',
      render: (r) => (
        <span className="font-semibold text-gema-primary dark:text-white">
          {r.codigo || `#${r.id.slice(0, 8)}`}
        </span>
      ),
    },
    {
      key: 'activo',
      header: 'Activo',
      render: (r) => (
        <div>
          <p className="font-semibold text-gema-primary dark:text-white">{r.activoNombre}</p>
          {r.activoCodigo && (
            <p className="text-xs text-gema-primary/50 dark:text-white/40">{r.activoCodigo}</p>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (r) => (
        <div className="max-w-xs">
          <p className="font-medium text-gema-primary dark:text-white line-clamp-2">
            {r.description}
          </p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Prioridad',
      render: (r) => <Badge estado={r.priority} />,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => (
        <Badge estado={r.status} />
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (r) => (
        <span className="text-sm text-gema-primary/70 dark:text-white/60">
          {r.created_at ? new Date(r.created_at).toLocaleDateString('es-VE') : '—'}
        </span>
      ),
    },
    {
      key: 'tecnico',
      header: 'Técnico',
      render: (r) => (
        <span className="text-sm font-medium text-gema-primary/80 dark:text-white/80">
          {r.tecnico || r.reported_by || 'Sin asignar'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/reportes/${r.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Ver reporte ${r.codigo || r.id}`}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <PermissionGuard module="mantenimiento" action="edit">
            <button
              type="button"
              onClick={() => {
                setSelectedReporte(r);
                setModalEstadoOpen(true);
              }}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Cambiar estado de ${r.codigo || r.id}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </PermissionGuard>
          <PermissionGuard module="mantenimiento" action="delete">
            <button
              type="button"
              onClick={() => handleDelete(r.id, r.codigo || r.id)}
              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label={`Eliminar reporte ${r.codigo || r.id}`}
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
            Reportes de Falla
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Seguimiento e historial de incidencias en equipos
          </p>
        </div>
        <PermissionGuard module="mantenimiento" action="create">
          <button
            type="button"
            onClick={() => setModalCrearOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo reporte
          </button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          icon={FileText}
          value={summary.total}
          label="Total reportes"
          loading={summaryLoading}
          tone="default"
        />
        <StatCard
          icon={Clock}
          value={summary.pendientes}
          label="Pendientes"
          loading={summaryLoading}
          tone="danger"
        />
        <StatCard
          icon={Wrench}
          value={summary.enProceso}
          label="En proceso"
          loading={summaryLoading}
          tone="accent"
        />
        <StatCard
          icon={CheckCircle2}
          value={summary.resueltos}
          label="Resueltos"
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
            placeholder="Buscar por código, activo o descripción..."
            aria-label="Buscar reportes"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
          <Select
            value={estadoFiltro}
            onChange={(value) => {
              setEstadoFiltro(value as ReporteEstado | '');
              setPage(1);
            }}
            options={ESTADO_FILTER_OPTIONS}
            aria-label="Filtrar por estado"
            className="sm:w-48"
          />
          <Select
            value={prioridadFiltro}
            onChange={(value) => {
              setPrioridadFiltro(value as ReportePrioridad | '');
              setPage(1);
            }}
            options={PRIORIDAD_FILTER_OPTIONS}
            aria-label="Filtrar por prioridad"
            className="sm:w-48"
          />
        </div>

        {error && empty ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={reportesEnriquecidos}
            keyExtractor={(r) => r.id}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}

        {!loading && !empty && meta.lastPage > 1 && (
          <nav
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
            aria-label="Paginación de reportes"
          >
            <p>
              Página {meta.page} de {meta.lastPage} — {meta.total} reportes
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

      <CrearReporteModal
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSave={handleCreate}
        saving={saving}
      />

      {modalEstadoOpen && selectedReporte && (
        <CambiarEstadoModal
          estadoActual={selectedReporte.status}
          isSubmitting={cambiandoEstado}
          onClose={() => {
            setModalEstadoOpen(false);
            setSelectedReporte(null);
          }}
          onConfirm={handleUpdateStatus}
        />
      )}
    </div>
  );
}