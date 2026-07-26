'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, History, MapPin, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { useUsuarios } from '@/hooks/useUsuarios';
import { getActivo, getCatalogArticle, getHistorialEstadosActivo } from '@/services/activos';
import type { ActivoResponse, CatalogArticleResponse } from '@/services/activos';
import type { LogEstadoActivo } from '@/types/activo';

function normalizeEstadoDisplay(estado: string): string {
  const map: Record<string, string> = {
    'operativo': 'Operativo',
    'en_mantenimiento': 'En mantenimiento',
    'fuera_de_servicio': 'Fuera de servicio',
    'dado_de_baja': 'Dado de baja',
  };
  return map[estado] || estado;
}

function FichaDeActivoContent() {
  const { id: activoId } = useParams<{ id: string }>();
  const { ubicaciones } = useUbicaciones();
  const { usuarios } = useUsuarios();
  const usuarioMap = useMemo(() => Object.fromEntries(usuarios.map(u => [u.id, u])), [usuarios]);

  const [asset, setAsset] = useState<ActivoResponse | null>(null);
  const [catalog, setCatalog] = useState<CatalogArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<LogEstadoActivo[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  const ubicacionName = useMemo(() => {
    if (!asset?.ubicacion_id || !ubicaciones.length) return null;
    const walk = (items: any[]): string | null => {
      for (const item of items) {
        if (item.id === asset.ubicacion_id) return item.nombre;
        if (item.hijos) { const r = walk(item.hijos); if (r) return r; }
      }
      return null;
    };
    return walk(ubicaciones);
  }, [asset?.ubicacion_id, ubicaciones]);

  useEffect(() => {
    if (!activoId) { setLoading(false); setError('ID de activo no especificado.'); return; }
    let cancelled = false;
    (async () => {
      try {
        const a = await getActivo(activoId);
        if (cancelled) return;
        setAsset(a);
        const [c, h] = await Promise.all([
          getCatalogArticle(a.articulo_id).catch(() => null as unknown as CatalogArticleResponse),
          getHistorialEstadosActivo(activoId).catch(() => [] as LogEstadoActivo[]),
        ]);
        if (cancelled) return;
        if (c) setCatalog(c);
        setHistorial(h);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar activo');
      } finally {
        if (!cancelled) { setLoading(false); setLoadingHistorial(false); }
      }
    })();
    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        getHistorialEstadosActivo(activoId).then(setHistorial).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onFocus); };
  }, [activoId]);

  const estado = asset ? normalizeEstadoDisplay(asset.estado) : '';

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader
        title="Activos / Ficha de activo"
        variant="activos"
        searchPlaceholder="Buscar activo..."
        searchLabel="Buscar activos"
      />

      <div className="mb-6">
        <Link href="/activos" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={!loading && !error && !asset}
        loadingMessage="Cargando activo..."
        emptyMessage="Activo no encontrado."
      >
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <div className="flex flex-col gap-3 border-b border-[#2E4365]/20 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{asset?.serial_interno || 'Sin nombre'}</h2>
              </div>
              {asset && (
                <Link
                  href={`/activos/${asset.id}/editar`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E59D12] text-black font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all"
                >
                  <Pencil className="w-4 h-4" strokeWidth={2} />
                  Editar
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <FileText className="w-4 h-4 text-[#E5920C]" />
                  Información General
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="md:col-span-2"><p className="text-xs text-gray-500 mb-1">ID Activo</p><p className="font-semibold break-all">{asset?.id || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Nombre del Activo</p><p className="font-semibold">{asset?.serial_interno || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Código Inventario</p><p className="font-semibold">{asset?.codigo_activo || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Artículo (catálogo)</p><p className="font-semibold">{catalog?.name ? <Link href={`/catalogo/${asset?.articulo_id}`} className="text-[#E59D12] hover:underline">{catalog.name}</Link> : '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Marca / Fabricante</p><p className="font-semibold">{catalog?.manufacturer || '—'}</p></div>
                </div>
              </div>

              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <MapPin className="w-4 h-4 text-[#E5920C]" />
                  Ubicación y Adquisición
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div><p className="text-xs text-gray-500 mb-1">Ubicación Física</p><p className="font-semibold">{ubicacionName || asset?.ubicacion_id || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Fecha de Compra</p><p className="font-semibold">{asset?.fecha_adquisicion || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Garantía Hasta</p><p className="font-semibold">—</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Estado</p><p className="font-semibold">{estado}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                <FileText className="w-4 h-4 text-[#E5920C]" />
                Valor del Activo
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <div><p className="text-xs text-gray-500 mb-1">Valor Monetario</p><p className="font-semibold">{asset?.valor_monetario != null ? `${asset.valor_monetario.toLocaleString('es-VE')} ${asset.moneda}` : '—'}</p></div>
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <h3 className="text-gray-800 font-bold text-base mb-5">Estado</h3>
              <div className="space-y-3">
                {['Operativo', 'En mantenimiento', 'Fuera de servicio', 'Dado de baja'].map((e) => (
                  <div key={e} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${e === estado ? 'border-[#ECA03C]' : 'border-gray-200 bg-white'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full ${e === estado ? 'bg-[#8B4513]' : 'bg-transparent border border-gray-300'}`} />
                    <span className="text-sm text-gray-700">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
              <History className="w-4 h-4 text-[#E5920C]" />
              Historial de estados
            </div>
            {loadingHistorial ? (
              <p className="text-sm text-gray-400">Cargando historial...</p>
            ) : historial.length === 0 ? (
              <p className="text-sm text-gray-400">Sin cambios de estado registrados.</p>
            ) : (
              <div className="space-y-3">
                {historial.map((log, i) => (
                  <div key={log.id} className="relative pl-6 border-l-2 border-[#E59D12]/30 last:border-l-0 last:pl-6">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-[#E59D12]" />
                    <p className="text-xs text-gray-400">{new Date(log.fecha_cambio).toLocaleString('es')}</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{log.estado_anterior ? normalizeEstadoDisplay(log.estado_anterior) : '—'}</span>
                      {' → '}
                      <span className="font-semibold">{normalizeEstadoDisplay(log.estado_nuevo)}</span>
                    </p>
                    {log.motivo && <p className="text-xs text-gray-500 italic">"{log.motivo}"</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{usuarioMap[log.usuario_id ?? '']?.nombre ?? 'Sistema'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </RequestState>
    </div>
  );
}

export default function FichaDeActivoPage() {
  return <FichaDeActivoContent />;
}
