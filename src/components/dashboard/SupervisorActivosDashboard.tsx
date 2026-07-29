'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Wrench, AlertCircle, Clock, Plus, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { useDashboard, type PlanRow } from '@/hooks/useDashboard';

export function SupervisorActivosDashboard() {
  const { data, loading, error } = useDashboard();

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gema-primary dark:text-white text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const total = data.totalActivos;

  function pct(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const planColumns: DataTableColumn<PlanRow>[] = [
    {
      key: 'nombre',
      header: 'Plan de mantenimiento',
      render: (plan) => (
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 p-2.5">
            <Box size={18} className="text-gema-accent" />
          </div>
          <span className="font-semibold text-gema-primary dark:text-white">{plan.nombre}</span>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Próxima ejecución',
      render: (plan) => formatDate(plan.proximaEjecucion),
    },
  ];

  const estadoBars = [
    { label: 'Operativo', value: data.operativo, barClass: 'bg-emerald-500', trackClass: 'bg-emerald-500/10' },
    { label: 'En mantenimiento', value: data.enMantenimiento, barClass: 'bg-gema-accent', trackClass: 'bg-gema-accent/10' },
    { label: 'Fuera de servicio', value: data.fueraDeServicio, barClass: 'bg-red-500', trackClass: 'bg-red-500/10' },
    { label: 'Dado de baja', value: data.dadoDeBaja, barClass: 'bg-gray-400', trackClass: 'bg-gray-400/10' },
  ];

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Dashboard / Supervisor de Activos
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Control de salud, disponibilidad y ciclo de vida de los activos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/activos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gema-accent text-gema-primary font-semibold text-sm hover:brightness-105 transition-all"
          >
            <Plus size={16} /> Registrar Activo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Box} value={total} label="Total de activos" loading={loading} tone="default" />
        <StatCard icon={Wrench} value={data.enMantenimiento} label="En mantenimiento" loading={loading} tone="accent" />
        <StatCard icon={AlertCircle} value={data.fueraDeServicio} label="Fuera de servicio" loading={loading} tone="danger" />
        <StatCard icon={Clock} value={data.planes.length} label="Planes preventivos" loading={loading} tone="default" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        <Card padding="lg" className="xl:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-gema-accent" strokeWidth={2} />
              <CardTitle>Próximos mantenimientos preventivos</CardTitle>
            </div>
            <Link
              href="/activos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline"
            >
              Ver activos <ArrowRight size={16} />
            </Link>
          </CardHeader>

          <DataTable
            columns={planColumns}
            data={data.planes}
            keyExtractor={(plan) => plan.id}
            loading={loading}
            emptyMessage="No hay mantenimientos programados"
          />
        </Card>

        <Card padding="lg" className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-gema-accent" strokeWidth={2} />
              <CardTitle>Estado de activos</CardTitle>
            </div>
          </CardHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-gema-primary/20 dark:border-white/20 border-t-gema-accent animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 mb-6">
              {estadoBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gema-primary dark:text-white">
                      {bar.label}
                    </span>
                    <span className="text-sm font-bold text-gema-primary dark:text-white">
                      {pct(bar.value, total)}% ({bar.value})
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-3 ${bar.trackClass}`}>
                    <div
                      className={`h-3 rounded-full ${bar.barClass}`}
                      style={{ width: `${Math.min(pct(bar.value, total), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
