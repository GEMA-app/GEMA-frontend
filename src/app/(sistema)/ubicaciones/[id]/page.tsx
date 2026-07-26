'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { getUbicacion } from '@/services/ubicaciones';
import type { Ubicacion } from '@/types/ubicacion';

const tipoLabels: Record<string, string> = {
  sede: 'Sede',
  planta: 'Planta',
  area: 'Área',
  seccion: 'Sección',
};

function UbicacionDetail() {
  const { id: ubicacionId } = useParams<{ id: string }>();
  const { ubicaciones } = useUbicaciones();
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const findParentName = useMemo(() => {
    if (!ubicacion?.parentId || !ubicaciones.length) return null;
    const walk = (items: Ubicacion[]): string | null => {
      for (const item of items) {
        if (item.id === ubicacion.parentId) return item.nombre;
        if (item.hijos) { const r = walk(item.hijos); if (r) return r; }
      }
      return null;
    };
    return walk(ubicaciones);
  }, [ubicacion?.parentId, ubicaciones]);

  useEffect(() => {
    if (!ubicacionId) { setLoading(false); setError('ID de ubicación no especificado.'); return; }
    let cancelled = false;
    (async () => {
      try {
        const u = await getUbicacion(ubicacionId);
        if (!cancelled) setUbicacion(u);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar ubicación');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ubicacionId]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader
        title="Ubicaciones / Detalle"
        variant="activos"
      />

      <div className="mb-6">
        <Link href="/ubicaciones" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={!loading && !error && !ubicacion}
        loadingMessage="Cargando ubicación..."
        emptyMessage="Ubicación no encontrada."
      >
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <div className="flex flex-col gap-3 border-b border-[#2E4365]/20 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{ubicacion?.nombre || 'Sin nombre'}</h2>
              </div>
              {ubicacion && (
                <PermissionGuard module="administracion" action="edit">
                  <Link
                    href={`/ubicaciones/${ubicacion.id}/editar`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E59D12] text-black font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all"
                  >
                    <Pencil className="w-4 h-4" strokeWidth={2} />
                    Editar
                  </Link>
                </PermissionGuard>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <MapPin className="w-4 h-4 text-[#E5920C]" />
                  Información de la Ubicación
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="md:col-span-2"><p className="text-xs text-gray-500 mb-1">ID</p><p className="font-semibold break-all">{ubicacion?.id || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Nombre</p><p className="font-semibold">{ubicacion?.nombre || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Tipo</p><p className="font-semibold">{ubicacion ? (tipoLabels[ubicacion.tipo] || ubicacion.tipo) : '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Ubicación Padre</p><p className="font-semibold">{findParentName || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Descripción</p><p className="font-semibold">{ubicacion?.descripcion || '—'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RequestState>
    </div>
  );
}

export default function UbicacionDetailPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <UbicacionDetail />
    </AuthGuard>
  );
}
