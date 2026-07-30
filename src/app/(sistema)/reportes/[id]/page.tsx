'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { getReporteById, updateReporte } from '@/services/reportes';
import { getActivos } from '@/services/activos';
import type { Reporte, ReporteEstado } from '@/types/reporte';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CambiarEstadoModal } from '@/components/reportes/CambiarEstadoModal';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function FichaReportePage() {
  const { id: reporteId } = useParams<{ id: string }>();

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [activoNombre, setActivoNombre] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => Boolean(reporteId));
  const [error, setError] = useState<string | null>(() =>
    reporteId ? null : 'ID de reporte no especificado.',
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const loadReporte = async (id: string) => {
    try {
      const rep = await getReporteById(id);
      setReporte(rep);
      if (rep.activo_id) {
        getActivos({ perPage: 200 })
          .then((res) => {
            const act = res.activos.find((a) => a.id === rep.activo_id);
            if (act) setActivoNombre(act.nombre);
          })
          .catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!reporteId) return;
    let cancelled = false;

    (async () => {
      try {
        const rep = await getReporteById(reporteId);
        if (cancelled) return;
        setReporte(rep);

        if (rep.activo_id) {
          getActivos({ perPage: 200 })
            .then((res) => {
              if (cancelled) return;
              const act = res.activos.find((a) => a.id === rep.activo_id);
              if (act) setActivoNombre(act.nombre);
            })
            .catch(() => {});
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar el reporte');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reporteId]);

  const handleCambiarEstado = async (nuevoEstado: ReporteEstado) => {
    if (!reporte) return;
    setCambiandoEstado(true);
    try {
      await updateReporte(reporte.id, {
        status: nuevoEstado,
        version: reporte.version,
      });
      await loadReporte(reporte.id);
      setModalOpen(false);
    } catch (err) {
      Swal.fire('Error', err instanceof Error ? err.message : 'No se pudo cambiar el estado del reporte.', 'error');
    } finally {
      setCambiandoEstado(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-gema-primary/20 dark:border-white/20 border-t-gema-accent animate-spin" />
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div className="text-center py-24">
        <p className="text-gema-primary dark:text-white text-lg font-medium">
          {error ?? 'Reporte no encontrado.'}
        </p>
        <Link
          href="/reportes"
          className="mt-4 inline-block text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline"
        >
          Volver a reportes
        </Link>
      </div>
    );
  }

  const estadoBadge = reporte.status;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/reportes"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a reportes
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            {reporte.codigo || `#${reporte.id.slice(0, 8)}`}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            {reporte.title || 'Reporte de falla'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGuard module="mantenimiento" action="edit">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2} />
              Cambiar estado
            </button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información del reporte</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Código</p>
              <p className="font-semibold text-gema-primary dark:text-white">
                {reporte.codigo || `#${reporte.id.slice(0, 8)}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Activo</p>
              <p className="font-semibold text-gema-primary dark:text-white">
                {activoNombre || reporte.location || 'Sin activo'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Prioridad</p>
              <Badge estado={reporte.priority} />
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Fecha de registro</p>
              <p className="font-semibold text-gema-primary dark:text-white">
                {reporte.created_at ? new Date(reporte.created_at).toLocaleString('es-VE') : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Reportado por / Técnico</p>
              <p className="font-semibold text-gema-primary dark:text-white">
                {reporte.tecnico || reporte.reported_by || 'Sin asignar'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Ubicación</p>
              <p className="font-semibold text-gema-primary dark:text-white">
                {reporte.location || 'General'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Descripción de falla</p>
              <p className="text-gema-primary dark:text-white whitespace-pre-wrap">
                {reporte.description || 'Sin descripción'}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Estado actual</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-start gap-4">
            <Badge estado={estadoBadge} className="text-sm px-4 py-2" />
            <p className="text-xs text-gema-primary/50 dark:text-white/40">
              Utilice &quot;Cambiar estado&quot; para actualizar el progreso del reporte.
            </p>
          </div>
        </Card>
      </div>

      {modalOpen && (
        <CambiarEstadoModal
          estadoActual={reporte.status}
          isSubmitting={cambiandoEstado}
          onClose={() => setModalOpen(false)}
          onConfirm={handleCambiarEstado}
        />
      )}
    </div>
  );
}
