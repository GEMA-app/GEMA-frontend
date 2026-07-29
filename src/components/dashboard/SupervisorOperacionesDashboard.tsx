'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, FileWarning, DollarSign, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';

export function SupervisorOperacionesDashboard() {
  const { data, loading, error } = useDashboard();

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gema-primary dark:text-white text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Dashboard / Supervisor de Operaciones
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Control de Órdenes de Trabajo, asignaciones, costos y reportes de falla
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/mantenimiento"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gema-accent text-gema-primary font-semibold text-sm hover:brightness-105 transition-all"
          >
            <Plus size={16} /> Crear OT
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Wrench} value={data.otsAbiertas} label="OTs abiertas" loading={loading} tone="accent" />
        <StatCard icon={FileWarning} value={data.reportesPendientes} label="Reportes de falla" loading={loading} tone="danger" />
        <StatCard icon={DollarSign} value={`${data.costoEjecutado} ${data.moneda}`} label="Costo acumulado" loading={loading} tone="default" />
        <StatCard icon={CheckCircle2} value={data.operativo} label="Activos operativos" loading={loading} tone="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Gestión de Mantenimiento</CardTitle>
            <Link href="/mantenimiento" className="text-sm text-gema-accent hover:underline inline-flex items-center gap-1">
              Ver todas las OTs <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <div className="p-4 bg-gema-bg-light dark:bg-gema-surface-dark-2 rounded-xl flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span>Órdenes de Trabajo Abiertas:</span>
              <span className="font-bold">{data.otsAbiertas}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Reportes de Falla Sin Atender:</span>
              <span className="font-bold text-red-500">{data.reportesPendientes}</span>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Acciones de Control</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <Link
              href="/mantenimiento"
              className="p-3 bg-gema-accent/10 hover:bg-gema-accent/20 rounded-xl text-gema-accent-dark dark:text-gema-accent font-semibold text-sm transition-colors flex items-center justify-between"
            >
              <span>Asignar técnicos a OTs pendientes</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/reportes"
              className="p-3 bg-gema-primary/5 dark:bg-white/5 hover:bg-gema-primary/10 rounded-xl text-gema-primary dark:text-white font-semibold text-sm transition-colors flex items-center justify-between"
            >
              <span>Revisar reportes de falla entrantes</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
