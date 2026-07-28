'use client';

import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Eye,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useOrdenesTrabajo } from '@/hooks/useOrdenesTrabajo';
import { useUsuariosMap } from '@/hooks/useUsuariosMap';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { formatTipoMantenimiento } from '@/lib/orden-trabajo';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, type EstadoOT } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import type { OrdenTrabajo } from '@/types/orden-trabajo';
import type { PlanMantenimiento, TipoMantenimiento as TipoPlan } from '@/types/plan-mantenimiento';

type Vista = 'ordenes' | 'calendario' | 'planes';
type TipoEvento = 'preventivo' | 'correctivo' | 'predictivo' | 'cancelado';

interface EventoCalendario {
  dia: number;
  titulo: string;
  tipo: TipoEvento;
}

const ESTADO_FILTER_OPTIONS: { value: EstadoOT | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'abierta', label: 'Abierta' },
  { value: 'en_proceso', label: 'En progreso' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'cerrada', label: 'Cerrada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const TIPO_PLAN_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
];

function planToEventos(
  planes: Array<{ nombre: string; tipo: TipoEvento; proxima_ejecucion: string }>,
  year: number,
  month: number
): EventoCalendario[] {
  return planes
    .filter((p) => p.proxima_ejecucion && p.proxima_ejecucion.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .map((p) => ({
      dia: Number(p.proxima_ejecucion.split('-')[2]),
      titulo: `${p.tipo === 'preventivo' ? 'Preventivo' : p.tipo === 'correctivo' ? 'Correctivo' : 'Predictivo'} — ${p.nombre}`,
      tipo: p.tipo as TipoEvento,
    }));
}

const DIAS_SEMANA = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const EVENTO_STYLES: Record<TipoEvento, string> = {
  preventivo: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-l-blue-600',
  correctivo: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-l-amber-600',
  predictivo: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-l-purple-600',
  cancelado: 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-300 border-l-gray-500',
};

function VistaTabs({ vista, onChange }: { vista: Vista; onChange: (v: Vista) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
      <button
        type="button"
        onClick={() => onChange('ordenes')}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
          vista === 'ordenes'
            ? 'bg-gema-primary dark:bg-white text-white dark:text-gema-primary'
            : 'bg-white dark:bg-gema-surface-dark text-gema-primary/70 dark:text-white/70 border border-gray-200 dark:border-white/10 hover:bg-gema-primary/5 dark:hover:bg-white/10'
        }`}
      >
        Órdenes de trabajo
      </button>
      <button
        type="button"
        onClick={() => onChange('calendario')}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
          vista === 'calendario'
            ? 'bg-gema-primary dark:bg-white text-white dark:text-gema-primary'
            : 'bg-white dark:bg-gema-surface-dark text-gema-primary/70 dark:text-white/70 border border-gray-200 dark:border-white/10 hover:bg-gema-primary/5 dark:hover:bg-white/10'
        }`}
      >
        Calendario
      </button>
      <button
        type="button"
        onClick={() => onChange('planes')}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
          vista === 'planes'
            ? 'bg-gema-primary dark:bg-white text-white dark:text-gema-primary'
            : 'bg-white dark:bg-gema-surface-dark text-gema-primary/70 dark:text-white/70 border border-gray-200 dark:border-white/10 hover:bg-gema-primary/5 dark:hover:bg-white/10'
        }`}
      >
        <ClipboardList className="w-4 h-4" />
        Planes
      </button>
    </div>
  );
}

function CalendarioView({
  planes = [],
}: {
  planes?: Array<{ nombre: string; tipo: TipoEvento; proxima_ejecucion: string }>;
}) {
  const router = useRouter();
  const hoy = new Date();
  const [fechaActual, setFechaActual] = useState(new Date());

  const cambiarMes = (incremento: number) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + incremento);
    setFechaActual(nueva);
  };

  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();
  const eventosDelMes = useMemo(() => planToEventos(planes, year, month), [planes, year, month]);

  const handleDayClick = (dia: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    const fechaStr = `${year}-${monthStr}-${diaStr}`;
    router.push(`/mantenimiento/nuevo?fecha=${fechaStr}`);
  };

  const celdas = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells: { dia: number | null; eventos: EventoCalendario[] }[] = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ dia: null, eventos: [] });
    }

    for (let dia = 1; dia <= daysInMonth; dia++) {
      cells.push({
        dia,
        eventos: eventosDelMes.filter((e) => e.dia === dia),
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ dia: null, eventos: [] });
    }

    return cells;
  }, [year, month, eventosDelMes]);

  const mes = fechaActual.toLocaleString('es', { month: 'long' });
  const año = fechaActual.getFullYear();

  return (
    <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="font-heading font-bold text-lg sm:text-xl text-gema-primary dark:text-white">
          Calendario de mantenimientos
        </h2>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          className="p-2 hover:bg-gema-primary/5 dark:hover:bg-white/10 rounded-xl text-gema-primary dark:text-white transition-colors cursor-pointer"
          aria-label="Mes anterior"
          onClick={() => cambiarMes(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-heading font-bold text-base sm:text-lg text-gema-primary dark:text-white capitalize">
          {mes} {año}
        </h3>
        <button
          type="button"
          className="p-2 hover:bg-gema-primary/5 dark:hover:bg-white/10 rounded-xl text-gema-primary dark:text-white transition-colors cursor-pointer"
          aria-label="Mes siguiente"
          onClick={() => cambiarMes(1)}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-white/10 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="bg-gray-50 dark:bg-gema-surface-dark-2 py-3 text-center text-xs font-bold text-gema-primary/60 dark:text-white/50">
            {d}
          </div>
        ))}
        {celdas.map((c, i) => {
          const esHoy =
            c.dia !== null &&
            fechaActual.getFullYear() === hoy.getFullYear() &&
            fechaActual.getMonth() === hoy.getMonth() &&
            c.dia === hoy.getDate();
          return (
            <div
              key={i}
              onClick={() => c.dia && handleDayClick(c.dia)}
              className={`bg-white dark:bg-gema-surface-dark min-h-[100px] p-2 ${
                c.dia ? 'cursor-pointer hover:bg-gema-accent/10 dark:hover:bg-gema-accent/10 transition-colors' : 'bg-gray-50/50 dark:bg-white/[0.02]'
              }`}
            >
              {c.dia && (
                <>
                  <div className="relative inline-block">
                    <span
                      className={`text-xs font-semibold ${
                        esHoy ? 'text-gray-900 bg-gema-accent px-2 py-0.5 rounded-full font-bold' : 'text-gema-primary dark:text-white'
                      }`}
                    >
                      {c.dia}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {c.eventos.map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        className={`text-[11px] px-1.5 py-0.5 rounded border-l-2 truncate ${
                          EVENTO_STYLES[ev.tipo] ?? EVENTO_STYLES.preventivo
                        }`}
                        title={ev.titulo}
                      >
                        {ev.titulo}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-6 text-xs text-gema-primary/70 dark:text-white/60">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-600" /> Preventivo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-600" /> Correctivo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-purple-600" /> Predictivo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-gray-500" /> Cancelado
        </span>
      </div>
    </div>
  );
}

function PlanesTabContent() {
  const [page, setPage] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSoloActivos, setFiltroSoloActivos] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const { planes, meta, loading, error, empty, eliminarPlan } = usePlanesMantenimiento({
    page,
    perPage: 15,
    tipo: (filtroTipo as TipoPlan) || undefined,
    activo: filtroSoloActivos || undefined,
  });

  const { activos } = useActivos({ search: busqueda });
  const activoMap = useMemo(() => new Map(activos.map((a) => [a.id, a.nombre])), [activos]);

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      if (!window.confirm(`¿Eliminar el plan "${nombre}"? Esta acción no se puede deshacer.`)) return;
      try {
        await eliminarPlan(id);
      } catch {
        alert('Error al eliminar el plan.');
      }
    },
    [eliminarPlan]
  );

  const columns: DataTableColumn<PlanMantenimiento>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (plan) => (
        <span className="font-semibold text-gema-primary dark:text-white">{plan.nombre}</span>
      ),
    },
    {
      key: 'activo',
      header: 'Activo',
      render: (plan) => (
        <span className="font-medium text-gema-primary/80 dark:text-white/80">
          {activoMap.get(plan.activo_id) || plan.activo_id}
        </span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (plan) => (
        <span className="capitalize text-gema-primary/80 dark:text-white/80">
          {plan.tipo}
        </span>
      ),
    },
    {
      key: 'intervalo',
      header: 'Intervalo (días)',
      className: 'text-center',
      render: (plan) => (
        <span className="text-gema-primary/80 dark:text-white/80">{plan.intervalo_dias}</span>
      ),
    },
    {
      key: 'proxima_ejecucion',
      header: 'Próxima ejecución',
      className: 'text-center',
      render: (plan) => (
        <span className="text-gema-primary/70 dark:text-white/70">{plan.proxima_ejecucion}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (plan) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            plan.activo
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
          }`}
        >
          {plan.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'urgencia',
      header: 'Urgencia',
      className: 'text-center',
      render: (plan) => (
        plan.es_urgente ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3 h-3" />
            Urgente
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-xs text-gray-400 dark:text-white/40">
            Normal
          </span>
        )
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (plan) => (
        <div className="flex items-center justify-end gap-2">
          <PermissionGuard module="mantenimiento" action="edit">
            <Link
              href={`/mantenimiento/planes/${plan.id}`}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Editar ${plan.nombre}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </PermissionGuard>
          <PermissionGuard module="mantenimiento" action="delete">
            <button
              type="button"
              onClick={() => handleDelete(plan.id, plan.nombre)}
              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label={`Eliminar ${plan.nombre}`}
            >
              <Trash className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
        <div className="flex-1 relative">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por activo..."
            aria-label="Buscar por activo"
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => {
            setFiltroTipo(e.target.value);
            setPage(1);
          }}
          aria-label="Filtrar por tipo"
          className="px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent sm:w-56"
        >
          {TIPO_PLAN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gema-primary/80 dark:text-white/80 cursor-pointer select-none px-2">
          <input
            type="checkbox"
            checked={filtroSoloActivos}
            onChange={(e) => {
              setFiltroSoloActivos(e.target.checked);
              setPage(1);
            }}
            className="accent-gema-accent w-4 h-4 rounded"
          />
          Solo activos
        </label>
      </div>

      <DataTable
        columns={columns}
        data={planes}
        keyExtractor={(plan) => plan.id}
        loading={loading}
        emptyMessage="No hay planes de mantenimiento registrados."
      />

      {!loading && meta.lastPage > 1 && (
        <nav
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
          aria-label="Paginación de planes"
        >
          <p>
            Página {meta.page} de {meta.lastPage} — {meta.total} planes
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
  );
}

const PER_PAGE = 15;

function OrdenesTrabajoContent() {
  const searchParams = useSearchParams();
  const vistaParam = searchParams.get('vista');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<EstadoOT | ''>('');
  const [vista, setVista] = useState<Vista>(() =>
    vistaParam === 'calendario' ? 'calendario' : vistaParam === 'planes' ? 'planes' : 'ordenes'
  );

  const { ordenes, meta, loading, error, empty, eliminarOrden } = useOrdenesTrabajo({
    search: debouncedSearch || undefined,
    estado: filtroEstado || undefined,
    page,
    perPage: PER_PAGE,
  });

  const { activos: listaActivos } = useActivos({ perPage: 200 });
  const activoMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of listaActivos) {
      map[a.id] = a.nombre;
    }
    return map;
  }, [listaActivos]);

  const { planes } = usePlanesMantenimiento({ activo: true });
  const { resolveNombre } = useUsuariosMap();

  const [summary, setSummary] = useState({
    abierta: 0,
    enProceso: 0,
    cerrada: 0,
    cancelada: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        const empresaId = await requireEmpresaId();
        const base = `/v1/empresas/${empresaId}/ordenes-trabajo`;
        const [abRes, procRes, cerRes, cancRes] = await Promise.all([
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=abierta`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=en_proceso`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=cerrada`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=cancelada`),
        ]);
        if (cancelled) return;
        setSummary({
          abierta: abRes.meta?.total ?? 0,
          enProceso: procRes.meta?.total ?? 0,
          cerrada: cerRes.meta?.total ?? 0,
          cancelada: cancRes.meta?.total ?? 0,
        });
      } catch {
        const counts = ordenes.reduce(
          (acc, o) => {
            acc[o.estado] = (acc[o.estado] ?? 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
        if (!cancelled) {
          setSummary({
            abierta: counts['abierta'] ?? 0,
            enProceso: counts['en_proceso'] ?? 0,
            cerrada: counts['cerrada'] ?? 0,
            cancelada: counts['cancelada'] ?? 0,
          });
        }
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [ordenes.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, codigo: string) => {
      const res = await Swal.fire({
        title: '¿Eliminar orden de trabajo?',
        text: `Se eliminará la orden "${codigo}". Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#EF4444',
      });
      if (!res.isConfirmed) return;
      try {
        await eliminarOrden(id);
        Swal.fire({ icon: 'success', title: 'Orden eliminada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error al eliminar', text: err instanceof Error ? err.message : 'Error al eliminar la orden' });
      }
    },
    [eliminarOrden]
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron órdenes para "${debouncedSearch}".`
    : filtroEstado
      ? `No hay órdenes con estado "${filtroEstado}".`
      : 'No hay órdenes de trabajo registradas. Crea la primera con el botón "Nueva OT".';

  const columns: DataTableColumn<OrdenTrabajo>[] = [
    {
      key: 'codigo_ot',
      header: 'Código OT',
      render: (orden) => <span className="font-semibold text-gema-primary dark:text-white">{orden.codigo_ot}</span>,
    },
    {
      key: 'activo',
      header: 'Activo',
      render: (orden) => (
        <span className="font-medium text-gema-primary dark:text-white">
          {activoMap[orden.activo_id] || orden.activo_id || 'Sin activo'}
        </span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (orden) => (
        <span className="capitalize text-gema-primary/80 dark:text-white/80">
          {formatTipoMantenimiento(orden.tipo)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (orden) => <Badge estado={orden.estado as EstadoOT} />,
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (orden) => (
        <span className="text-gema-primary/70 dark:text-white/70">
          {orden.fecha_inicio_trabajo || orden.fecha_apertura || '—'}
        </span>
      ),
    },
    {
      key: 'tecnico',
      header: 'Técnico asignado',
      render: (orden) => (
        <span className="text-gema-primary/80 dark:text-white/80">
          {resolveNombre(orden.supervisor_id) || 'Sin asignar'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (orden) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/mantenimiento/${orden.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Ver ${orden.codigo_ot}`}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <PermissionGuard module="mantenimiento" action="edit">
            <Link
              href={`/mantenimiento/${orden.id}/editar`}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Editar ${orden.codigo_ot}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </PermissionGuard>
          <PermissionGuard module="mantenimiento" action="delete">
            <button
              type="button"
              onClick={() => handleDelete(orden.id, orden.codigo_ot)}
              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label={`Eliminar ${orden.codigo_ot}`}
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
            Mantenimiento
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Gestión de órdenes de trabajo y mantenimientos
          </p>
        </div>
        {vista === 'planes' ? (
          <PermissionGuard module="mantenimiento" action="create">
            <Link
              href="/mantenimiento/planes/nuevo"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Nuevo plan
            </Link>
          </PermissionGuard>
        ) : (
          <PermissionGuard module="mantenimiento" action="create">
            <Link
              href="/mantenimiento/nuevo"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Nueva OT
            </Link>
          </PermissionGuard>
        )}
      </div>

      <VistaTabs vista={vista} onChange={setVista} />

      {vista === 'ordenes' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <StatCard icon={Clock} value={summary.abierta} label="Abiertas" loading={summaryLoading} tone="default" />
            <StatCard icon={Wrench} value={summary.enProceso} label="En proceso" loading={summaryLoading} tone="accent" />
            <StatCard icon={CheckCircle2} value={summary.cerrada} label="Cerradas" loading={summaryLoading} tone="accent" />
            <StatCard icon={XCircle} value={summary.cancelada} label="Canceladas" loading={summaryLoading} tone="danger" />
          </div>

          <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código de OT o activo..."
                aria-label="Buscar órdenes de trabajo"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
              />
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value as EstadoOT | '');
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
                data={ordenes}
                keyExtractor={(orden) => orden.id}
                loading={loading}
                emptyMessage={emptyMessage}
              />
            )}

            {!loading && !empty && meta.lastPage > 1 && (
              <nav
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
                aria-label="Paginación de órdenes"
              >
                <p>
                  Página {meta.page} de {meta.lastPage} — {meta.total} órdenes
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
        </>
      )}

      {vista === 'calendario' && <CalendarioView planes={planes} />}

      {vista === 'planes' && <PlanesTabContent />}
    </div>
  );
}

export default function OrdenesTrabajoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gema-primary/50 dark:text-white/50">Cargando...</div>}>
      <OrdenesTrabajoContent />
    </Suspense>
  );
}


