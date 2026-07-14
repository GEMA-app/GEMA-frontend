'use client';

/**
 * Vista de solo lectura de un activo. Carga el activo y su artículo de catálogo,
 * y resuelve el nombre de ubicación desde el árbol de ubicaciones.
 *
 * Recibe el ID del activo de la ruta dinámica `/activos/[id]` usando useParams.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, MapPin, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { formatEstadoActivo } from '@/lib/activos';
import { getActivo } from '@/services/activos';
import { getCatalogArticle } from '@/services/catalogo';
import type { ActivoResponse, CatalogArticleResponse } from '@/types/activo';
import type { Ubicacion } from '@/types/ubicacion';

export default function FichaDeActivoPage() {
  const params = useParams();
  const activoId = params.id as string;
  const { ubicaciones } = useUbicaciones();

  const [asset, setAsset] = useState<ActivoResponse | null>(null);
  const [catalog, setCatalog] = useState<CatalogArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resuelve el nombre de ubicación recorriendo el árbol recursivamente
  const ubicacionName = useMemo((): string | null => {
    if (!asset?.ubicacion_id || !ubicaciones.length) return null;

    const walk = (items: Ubicacion[]): string | null => {
      for (const item of items) {
        if (item.id === asset.ubicacion_id) return item.nombre;
        if (item.hijos) {
          const found = walk(item.hijos);
          if (found) return found;
        }
      }
      return null;
    };

    return walk(ubicaciones);
  }, [asset?.ubicacion_id, ubicaciones]);

  // Fetch: activo primero, luego catálogo
  useEffect(() => {
    if (!activoId) {
      setLoading(false);
      setError('ID de activo no especificado.');
      return;
    }

    let cancelled = false;

    // El flag `cancelled` evita setear estado si el componente ya se desmontó
    void (async () => {
      try {
        const a = await getActivo(activoId);
        if (cancelled) return;
        setAsset(a);

        const c = await getCatalogArticle(a.articulo_id);
        if (!cancelled) setCatalog(c);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar activo');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [activoId]);

  // Valores derivados
  const estadoDisplay = asset ? formatEstadoActivo(asset.estado) : '';
  const estadoOptions = ['Operativo', 'En mantenimiento', 'Fuera de servicio', 'Dado de baja'];

  // Render 
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader
        title="Activos / Ficha de activo"
        variant="activos"
        searchPlaceholder="Buscar activo..."
        searchLabel="Buscar activos"
      />

      {/* Link de regreso */}
      <div className="mb-6">
        <Link
          href="/activos"
          className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit"
        >
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
        <div
          className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8"
          style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}
        >
          {/* Nombre del activo + botón editar */}
          <div className="flex flex-col gap-3 border-b border-[#2E4365]/20 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {asset?.serial_interno || 'Sin nombre'}
                </h2>
              </div>
              {asset && (
                <Link
                  href={`/activos/editar/${asset.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E59D12] text-black font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all"
                >
                  <Pencil className="w-4 h-4" strokeWidth={2} />
                  Editar
                </Link>
              )}
            </div>

            {/* Tarjetas de info general y ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Info general */}
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <FileText className="w-4 h-4 text-[#E5920C]" />
                  Información general
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">ID del activo</p>
                    <p className="font-semibold break-all">{asset?.id || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nombre del activo</p>
                    <p className="font-semibold">{asset?.serial_interno || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Código de inventario</p>
                    <p className="font-semibold">{asset?.codigo_activo || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Categoría</p>
                    <p className="font-semibold">{catalog?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Marca / Fabricante</p>
                    <p className="font-semibold">{catalog?.manufacturer || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación y adquisición */}
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <MapPin className="w-4 h-4 text-[#E5920C]" />
                  Ubicación y adquisición
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ubicación física</p>
                    <p className="font-semibold">{ubicacionName || asset?.ubicacion_id || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha de compra</p>
                    <p className="font-semibold">{asset?.fecha_adquisicion || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Garantía hasta</p>
                    <p className="font-semibold">—</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Estado</p>
                    <p className="font-semibold">{estadoDisplay}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Valor monetario + selector de estado (solo lectura) */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

            {/* Valor monetario */}
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                <FileText className="w-4 h-4 text-[#E5920C]" />
                Valor del activo
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Valor monetario</p>
                  <p className="font-semibold">
                    {asset?.valor_monetario != null
                      ? `${asset.valor_monetario.toLocaleString('es-VE')} ${asset.moneda}`
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estado actual resaltado (solo lectura) */}
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <h3 className="text-gray-800 font-bold text-base mb-5">Estado</h3>
              <div className="space-y-3">
                {estadoOptions.map((e) => (
                  <div
                    key={e}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${e === estadoDisplay ? 'border-[#ECA03C]' : 'border-gray-200 bg-white'
                      }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${e === estadoDisplay
                          ? 'bg-[#8B4513]'
                          : 'bg-transparent border border-gray-300'
                        }`}
                    />
                    <span className="text-sm text-gray-700">{e}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </RequestState>
    </div>
  );
}
