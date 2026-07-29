'use client';

import React from 'react';
import { Box, Wrench, FileWarning, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';

export function ConsultorDashboard() {
  const { data, loading, error } = useDashboard();

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gema-primary dark:text-white text-lg font-medium">{error}</p>
      </div>
    );
  }

  const total = data.totalActivos;

  function pct(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
          Dashboard / Consultor
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
          Resumen ejecutivo global e indicadores de rendimiento operativo de la planta
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Box} value={total} label="Total de activos" loading={loading} tone="default" />
        <StatCard icon={Wrench} value={data.otsAbiertas} label="OTs abiertas" loading={loading} tone="accent" />
        <StatCard icon={FileWarning} value={data.reportesPendientes} label="Reportes de falla" loading={loading} tone="danger" />
        <StatCard icon={DollarSign} value={`${data.costoEjecutado} ${data.moneda}`} label="Costo ejecutado" loading={loading} tone="default" />
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Disponibilidad y Salud del Parque Industrial</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-xl text-center">
            <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {pct(data.operativo, total)}%
            </span>
            <span className="text-xs text-gema-primary/70 dark:text-white/70">Activos Operativos</span>
          </div>
          <div className="p-4 bg-gema-accent/10 rounded-xl text-center">
            <span className="block text-2xl font-bold text-gema-accent-dark dark:text-gema-accent">
              {pct(data.enMantenimiento, total)}%
            </span>
            <span className="text-xs text-gema-primary/70 dark:text-white/70">En Mantenimiento</span>
          </div>
          <div className="p-4 bg-red-500/10 rounded-xl text-center">
            <span className="block text-2xl font-bold text-red-500">
              {pct(data.fueraDeServicio, total)}%
            </span>
            <span className="text-xs text-gema-primary/70 dark:text-white/70">Fuera de Servicio</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
