'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, MapPin, Loader2 } from 'lucide-react';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { getUbicacion } from '@/services/ubicaciones';
import type { Ubicacion } from '@/types/ubicacion';
import { Badge, type EstadoBadgeType } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export default function UbicacionDetailPage() {
  const params = useParams();
  const ubicacionId = params.id as string;

  const { ubicaciones } = useUbicaciones();
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const findParentName = useMemo(() => {
    if (!ubicacion?.parentId || !ubicaciones.length) return null;
    const walk = (items: Ubicacion[]): string | null => {
      for (const item of items) {
        if (item.id === ubicacion.parentId) return item.nombre;
        if (item.hijos) {
          const r = walk(item.hijos);
          if (r) return r;
        }
      }
      return null;
    };
    return walk(ubicaciones);
  }, [ubicacion?.parentId, ubicaciones]);

  useEffect(() => {
    if (!ubicacionId) {
      setLoading(false);
      setError('ID de ubicación no especificado.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const u = await getUbicacion(ubicacionId);
        if (!cancelled) setUbicacion(u);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar la ubicación.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ubicacionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-gema-accent mb-3" />
        <p className="text-sm text-gema-primary/60 dark:text-white/50">Cargando ubicación...</p>
      </div>
    );
  }

  if (error || !ubicacion) {
    return (
      <div className="text-center py-24">
        <p className="text-gema-primary dark:text-white text-lg font-medium">
          {error ?? 'Ubicación no encontrada.'}
        </p>
        <Link
          href="/ubicaciones"
          className="mt-4 inline-block text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline"
        >
          Volver a ubicaciones
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/ubicaciones"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a ubicaciones
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            {ubicacion.nombre}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Detalle de la ubicación en el árbol jerárquico
          </p>
        </div>
        <Link
          href={`/ubicaciones/${ubicacion.id}/editar`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Pencil className="w-4 h-4" strokeWidth={2} />
          Editar ubicación
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-gema-accent" />
              <CardTitle>Información de la ubicación</CardTitle>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Nombre</p>
              <p className="font-semibold text-gema-primary dark:text-white">{ubicacion.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Tipo</p>
              <div>
                <Badge estado={ubicacion.tipo as EstadoBadgeType} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Ubicación padre</p>
              <p className="font-semibold text-gema-primary dark:text-white">{findParentName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">ID</p>
              <p className="font-semibold text-gema-primary/80 dark:text-white/80 break-all">{ubicacion.id}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Descripción</p>
              <p className="font-medium text-gema-primary dark:text-white leading-relaxed">
                {ubicacion.descripcion || 'Sin descripción registrada.'}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Resumen jerárquico</CardTitle>
          </CardHeader>
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-gema-bg-light dark:bg-gema-surface-dark-2 border border-gema-primary/10 dark:border-white/10">
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mb-1">Sub-ubicaciones</p>
              <p className="font-heading font-extrabold text-2xl text-gema-primary dark:text-white">
                {ubicacion.hijos?.length ?? 0}
              </p>
            </div>
            <p className="text-xs text-gema-primary/60 dark:text-white/50 leading-relaxed">
              Las ubicaciones organizan el inventario de activos y el mantenimiento preventivo por zonas operativas.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
