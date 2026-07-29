'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, Clock, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';

export function TecnicoDashboard() {
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
            Panel Técnico / Mis Trabajos
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Seguimiento de órdenes asignadas e intervenciones de mantenimiento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Wrench} value={data.otsAbiertas} label="Mis OTs asignadas" loading={loading} tone="accent" />
        <StatCard icon={Clock} value={data.enMantenimiento} label="Intervenciones activas" loading={loading} tone="default" />
        <StatCard icon={CheckCircle2} value={data.operativo} label="Activos atendidos" loading={loading} tone="default" />
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Mis Trabajos Pendientes</CardTitle>
          <Link href="/mantenimiento" className="text-sm text-gema-accent hover:underline flex items-center gap-1">
            Ver todas mis OTs <ArrowRight size={14} />
          </Link>
        </CardHeader>
        <div className="p-4 bg-gema-bg-light dark:bg-gema-surface-dark-2 rounded-xl text-center">
          <p className="text-sm text-gema-primary/70 dark:text-white/70 mb-4">
            Tienes {data.otsAbiertas} orden(es) de trabajo pendientes de ejecución.
          </p>
          <Link
            href="/mantenimiento"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gema-accent text-gema-primary font-semibold text-sm rounded-xl hover:brightness-105"
          >
            <Play size={16} /> Ir a mis OTs
          </Link>
        </div>
      </Card>
    </div>
  );
}
