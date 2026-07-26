'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash, Search, ClipboardList } from 'lucide-react';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import type { PlanMantenimiento, TipoMantenimiento } from '@/types/plan-mantenimiento';

const TIPO_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los tipos' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
];

const PER_PAGE = 15;

export default function PlanesPage() {
  const [page, setPage] = useState(1);
  const [filtroActivoId, setFiltroActivoId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSoloActivos, setFiltroSoloActivos] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const { planes, meta, loading, error, empty, eliminarPlan } = usePlanesMantenimiento({
    page,
    perPage: PER_PAGE,
    activo_id: filtroActivoId || undefined,
    tipo: (filtroTipo as TipoMantenimiento) || undefined,
    activo: filtroSoloActivos || undefined,
  });

  const { activos } = useActivos({ search: busqueda });
  const activoMap = new Map(activos.map((a) => [a.id, a.nombre]));

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
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (plan) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/mantenimiento/planes/${plan.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Editar ${plan.nombre}`}
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(plan.id, plan.nombre)}
            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            aria-label={`Eliminar ${plan.nombre}`}
          >
            <Trash className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Planes de mantenimiento
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Programación y rutinas periódicas de mantenimiento
          </p>
        </div>
        <Link
          href="/mantenimiento/planes/nuevo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo plan
        </Link>
      </div>

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
            {TIPO_OPTIONS.map((option) => (
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
    </div>
  );
}

