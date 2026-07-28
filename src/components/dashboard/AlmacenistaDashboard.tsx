'use client';

import React from 'react';
import Link from 'next/link';
import { PackageX, Box, Plus, ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';

export function AlmacenistaDashboard() {
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
            Dashboard / Almacenista
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Control de inventario de repuestos, alertas de stock mínimo y movimientos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gema-accent text-gema-primary font-semibold text-sm hover:brightness-105 transition-all"
          >
            <Plus size={16} /> Entradas / Salidas
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={PackageX} value={data.repuestosBajoMinimo} label="Stock bajo mínimo" loading={loading} tone="danger" />
        <StatCard icon={Box} value="—" label="Artículos registrados" loading={loading} tone="default" />
        <StatCard icon={ArrowUpRight} value="—" label="Movimientos del día" loading={loading} tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Estado del Inventario</CardTitle>
            <Link href="/inventario" className="text-sm text-gema-accent hover:underline flex items-center gap-1">
              Ir a inventario <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <div className="p-4 bg-gema-bg-light dark:bg-gema-surface-dark-2 rounded-xl">
            <p className="text-sm text-gema-primary/70 dark:text-white/70">
              Actualmente hay <span className="font-bold text-red-500">{data.repuestosBajoMinimo}</span> artículos en o por debajo del límite de stock mínimo de reposición.
            </p>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Operaciones Rápidas de Almacén</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <Link
              href="/inventario"
              className="p-3 bg-gema-accent/10 hover:bg-gema-accent/20 rounded-xl text-gema-accent-dark dark:text-gema-accent font-semibold text-sm transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ArrowDownRight size={16} /> Registrar entrada de stock
              </span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/inventario"
              className="p-3 bg-gema-primary/5 dark:bg-white/5 hover:bg-gema-primary/10 rounded-xl text-gema-primary dark:text-white font-semibold text-sm transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ArrowUpRight size={16} /> Registrar salida de repuestos
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
