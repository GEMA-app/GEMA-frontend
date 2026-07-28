'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Wrench, PackageX, FileWarning, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';

export function DefaultDashboard() {
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
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-gema-primary via-gema-primary/95 to-gema-surface-dark p-6 sm:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gema-accent/20 text-gema-accent text-xs font-semibold mb-3 border border-gema-accent/30">
            <ShieldCheck size={14} /> Sistema GEMA
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white">
            ¡Bienvenido a GEMA!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
            Gestión y Mantenimiento de Activos Industriales. Accede rápidamente a los módulos principales o explora los indicadores generales de la organización.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Box} value={data.totalActivos} label="Activos totales" loading={loading} tone="default" />
        <StatCard icon={Wrench} value={data.otsAbiertas} label="OTs abiertas" loading={loading} tone="accent" />
        <StatCard icon={PackageX} value={data.repuestosBajoMinimo} label="Stock mínimo" loading={loading} tone="danger" />
        <StatCard icon={FileWarning} value={data.reportesPendientes} label="Reportes pendientes" loading={loading} tone="accent" />
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Módulos Principales del Sistema</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/activos"
            className="p-4 rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 hover:bg-gema-accent/10 border border-transparent hover:border-gema-accent/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <Box className="w-8 h-8 text-gema-accent mb-2" />
              <h3 className="font-bold text-gema-primary dark:text-white group-hover:text-gema-accent">Activos</h3>
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mt-1">Gestión del parque industrial</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gema-accent mt-4 self-end group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/mantenimiento"
            className="p-4 rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 hover:bg-gema-accent/10 border border-transparent hover:border-gema-accent/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <Wrench className="w-8 h-8 text-gema-accent mb-2" />
              <h3 className="font-bold text-gema-primary dark:text-white group-hover:text-gema-accent">Mantenimiento</h3>
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mt-1">Órdenes de trabajo y planes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gema-accent mt-4 self-end group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/inventario"
            className="p-4 rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 hover:bg-gema-accent/10 border border-transparent hover:border-gema-accent/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <PackageX className="w-8 h-8 text-gema-accent mb-2" />
              <h3 className="font-bold text-gema-primary dark:text-white group-hover:text-gema-accent">Inventario</h3>
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mt-1">Repuestos y almacén</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gema-accent mt-4 self-end group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/reportes"
            className="p-4 rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 hover:bg-gema-accent/10 border border-transparent hover:border-gema-accent/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <FileWarning className="w-8 h-8 text-gema-accent mb-2" />
              <h3 className="font-bold text-gema-primary dark:text-white group-hover:text-gema-accent">Reportes</h3>
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mt-1">Reportes de falla</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gema-accent mt-4 self-end group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
