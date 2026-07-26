'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Monitor,
  AlertCircle,
  ClipboardList,
  Box,
  Wrench,
  PackageX,
  FileWarning,
} from 'lucide-react';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { getReportes } from '@/services/reportes';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';

interface PlanRow {
  id: string;
  nombre: string;
  proximaEjecucion: string;
}

export default function DashboardPage() {
  const [data, setData] = useState({
    totalActivos: 0,
    enMantenimiento: 0,
    operativo: 0,
    fueraDeServicio: 0,
    dadoDeBaja: 0,
    costoEjecutado: 0,
    moneda: 'USD',
    otsAbiertas: 0,
    repuestosBajoMinimo: 0,
    reportesPendientes: 0,
    planes: [] as PlanRow[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const empresaId = await requireEmpresaId();
        const base = `/v1/empresas/${empresaId}/activos`;

        const [totalRes, opRes, mantRes, fueraRes, bajaRes] = await Promise.all([
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=operativo`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=en_mantenimiento`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=fuera_de_servicio`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=dado_de_baja`),
        ]);

        let planes: PlanRow[] = [];
        try {
          const planesRes = await fetchWithAuth<{
            data: Array<{ id: string; attributes: { nombre: string; proxima_ejecucion: string | null } }>;
          }>(`/v1/empresas/${empresaId}/planes-mantenimiento?limit=5`);
          planes = (planesRes.data ?? [])
            .filter((p) => p.attributes.proxima_ejecucion)
            .sort(
              (a, b) =>
                new Date(a.attributes.proxima_ejecucion!).getTime() -
                new Date(b.attributes.proxima_ejecucion!).getTime(),
            )
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              nombre: p.attributes.nombre,
              proximaEjecucion: p.attributes.proxima_ejecucion!,
            }));
          // ponytail: no asset name resolution, show plan name only. Add when users ask.
        } catch {
          // ponytail: planes are non-critical, silently skip
        }

        let costoEjecutado = 0;
        let moneda = 'USD';
        try {
          const ordsRes = await fetchWithAuth<{
            data: Array<{ attributes: { costo_real: number | null; moneda: string } }>;
          }>(`/v1/empresas/${empresaId}/ordenes-trabajo?limit=100`);
          for (const ot of ordsRes.data ?? []) {
            if (ot.attributes.costo_real) {
              costoEjecutado += ot.attributes.costo_real;
              moneda = ot.attributes.moneda || moneda;
            }
          }
          // ponytail: sums only from first 100 work orders. Add pagination when >100 OTs exist.
        } catch {
          // ponytail: non-critical, show 0
        }

        let otsAbiertas = 0;
        try {
          const otBase = `/v1/empresas/${empresaId}/ordenes-trabajo`;
          const [abiertaRes, enProcesoRes] = await Promise.all([
            fetchWithAuth<{ meta: { total: number } }>(`${otBase}?limit=1&estado=abierta`),
            fetchWithAuth<{ meta: { total: number } }>(`${otBase}?limit=1&estado=en_proceso`),
          ]);
          otsAbiertas = (abiertaRes.meta?.total ?? 0) + (enProcesoRes.meta?.total ?? 0);
        } catch {
          // ponytail: non-critical, show 0
        }

        let repuestosBajoMinimo = 0;
        try {
          // ponytail: backend module for repuestos not confirmed yet; falls back to 0 if the endpoint doesn't exist.
          const repRes = await fetchWithAuth<{ meta: { total: number } }>(
            `/v1/empresas/${empresaId}/repuestos?limit=1&bajo_minimo=true`,
          );
          repuestosBajoMinimo = repRes.meta?.total ?? 0;
        } catch {
          // ponytail: non-critical, show 0
        }

        let reportesPendientes = 0;
        try {
          const { meta: reportesMeta } = await getReportes({ status: 'pendiente', perPage: 1 });
          reportesPendientes = reportesMeta.total;
        } catch {
          // ponytail: non-critical, show 0
        }

        if (!cancelled) {
          setData({
            totalActivos: totalRes.meta?.total ?? 0,
            enMantenimiento: mantRes.meta?.total ?? 0,
            operativo: opRes.meta?.total ?? 0,
            fueraDeServicio: fueraRes.meta?.total ?? 0,
            dadoDeBaja: bajaRes.meta?.total ?? 0,
            costoEjecutado: Math.round(costoEjecutado * 100) / 100,
            moneda,
            otsAbiertas,
            repuestosBajoMinimo,
            reportesPendientes,
            planes,
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos');
          setLoading(false);
        }
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  function pct(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

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

  const planColumns: DataTableColumn<PlanRow>[] = [
    {
      key: 'nombre',
      header: 'Plan de mantenimiento',
      render: (plan) => (
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 p-2.5">
            <Monitor size={18} className="text-gema-accent" />
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
    {
      key: 'accion',
      header: '',
      className: 'text-right',
      render: () => (
        <button className="text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline cursor-pointer">
          Asignar
        </button>
      ),
    },
  ];

  const estadoBars = [
    {
      label: 'Operativo',
      value: data.operativo,
      barClass: 'bg-emerald-500',
      trackClass: 'bg-emerald-500/10',
    },
    {
      label: 'En mantenimiento',
      value: data.enMantenimiento,
      barClass: 'bg-gema-accent',
      trackClass: 'bg-gema-accent/10',
    },
    {
      label: 'Fuera de servicio',
      value: data.fueraDeServicio,
      barClass: 'bg-red-500',
      trackClass: 'bg-red-500/10',
    },
  ];

  const fueraPct = pct(data.fueraDeServicio, total);
  const mantPct = pct(data.enMantenimiento, total);
  let alerta: { msg: string; tone: 'danger' | 'warning' | 'info' } | null = null;
  if (fueraPct > 10) {
    alerta = {
      msg: `${fueraPct}% de los activos están fuera de servicio. Requiere atención inmediata.`,
      tone: 'danger',
    };
  } else if (mantPct > 20) {
    alerta = {
      msg: `${mantPct}% de los activos están en mantenimiento. Revise las órdenes de trabajo pendientes.`,
      tone: 'warning',
    };
  } else if (data.enMantenimiento > 0) {
    alerta = {
      msg: `${data.enMantenimiento} activo(s) en mantenimiento (${mantPct}% del total). Sin novedades críticas.`,
      tone: 'info',
    };
  }

  const alertaClasses = {
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    warning: 'bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent',
    info: 'bg-gema-primary/5 dark:bg-white/5 text-gema-primary/80 dark:text-white/70',
  } as const;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-gema-primary dark:text-white">
          Resumen operativo
        </h1>
        <p className="mt-1 text-sm text-gema-primary/60 dark:text-white/50">
          Vista general del estado actual de los activos
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard icon={Box} value={total} label="Activos totales" loading={loading} tone="default" />
        <StatCard
          icon={Wrench}
          value={data.otsAbiertas}
          label="OTs abiertas"
          loading={loading}
          tone="accent"
        />
        <StatCard
          icon={PackageX}
          value={data.repuestosBajoMinimo}
          label="Repuestos bajo mínimo"
          loading={loading}
          tone="danger"
        />
        <StatCard
          icon={FileWarning}
          value={data.reportesPendientes}
          label="Reportes pendientes"
          loading={loading}
          tone="accent"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card padding="lg" className="xl:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-gema-accent" strokeWidth={2} />
              <CardTitle>Próximos mantenimientos preventivos</CardTitle>
            </div>
            <Link
              href="/reportes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline whitespace-nowrap cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" aria-hidden />
              Ver reportes
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
            <>
              <div className="flex flex-col gap-6 mb-6">
                {estadoBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gema-primary dark:text-white">
                        {bar.label}
                      </span>
                      <span className="text-sm font-bold text-gema-primary dark:text-white">
                        {pct(bar.value, total)}%
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

              {alerta && (
                <div
                  className={`rounded-2xl p-4 flex items-start gap-3 ${alertaClasses[alerta.tone]}`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm leading-relaxed">
                    <span className="font-bold">
                      {alerta.tone === 'danger' ? 'Alerta:' : 'Atención:'}
                    </span>{' '}
                    {alerta.msg}
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
