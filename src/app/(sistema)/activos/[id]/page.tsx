'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, History, RefreshCw, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { useUsuarios } from '@/hooks/useUsuarios';
import {
  getActivo,
  getCatalogArticle,
  getHistorialEstadosActivo,
  updateActivo,
} from '@/services/activos';
import { normalizeAssetStatus } from '@/lib/activos';
import type { ActivoResponse, CatalogArticleResponse } from '@/services/activos';
import type { ActivoEstado, LogEstadoActivo } from '@/types/activo';
import { Badge, type EstadoActivo } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const ESTADO_OPTIONS: { value: ActivoEstado; label: string }[] = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'en_mantenimiento', label: 'En mantenimiento' },
  { value: 'fuera_de_servicio', label: 'Fuera de servicio' },
  { value: 'dado_de_baja', label: 'Dado de baja' },
];

interface CambiarEstadoModalProps {
  estadoActual: ActivoEstado;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (nuevoEstado: ActivoEstado) => void;
}

function CambiarEstadoModal({ estadoActual, isSubmitting, onClose, onConfirm }: CambiarEstadoModalProps) {
  const [seleccion, setSeleccion] = useState<ActivoEstado>(estadoActual);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-md bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-lg text-gema-primary dark:text-white">Cambiar estado</h3>
            <p className="text-sm text-gema-primary/60 dark:text-white/50 mt-1">
              Selecciona el nuevo estado del activo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-lg text-gema-primary/50 hover:bg-gema-primary/5 dark:text-white/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {ESTADO_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                seleccion === option.value
                  ? 'border-gema-accent bg-gema-accent/10'
                  : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <input
                type="radio"
                name="nuevoEstado"
                value={option.value}
                checked={seleccion === option.value}
                onChange={() => setSeleccion(option.value)}
                className="accent-gema-accent w-4 h-4"
              />
              <span className="text-sm font-medium text-gema-primary dark:text-white">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting || seleccion === estadoActual}
            onClick={() => onConfirm(seleccion)}
            className="px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 text-sm font-semibold transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar cambio'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FichaDeActivoPage() {
  const { id: activoId } = useParams<{ id: string }>();
  const { ubicaciones } = useUbicaciones();
  const { usuarios } = useUsuarios();
  const usuarioMap = useMemo(() => Object.fromEntries(usuarios.map((u) => [u.id, u])), [usuarios]);

  const [asset, setAsset] = useState<ActivoResponse | null>(null);
  const [catalog, setCatalog] = useState<CatalogArticleResponse | null>(null);
  const [loading, setLoading] = useState(() => Boolean(activoId));
  const [error, setError] = useState<string | null>(() =>
    activoId ? null : 'ID de activo no especificado.',
  );
  const [historial, setHistorial] = useState<LogEstadoActivo[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(() => Boolean(activoId));

  const [modalOpen, setModalOpen] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const ubicacionName = useMemo(() => {
    if (!asset?.ubicacion_id || !ubicaciones.length) return null;
    const walk = (items: Array<{ id: string; nombre: string; hijos?: unknown[] }>): string | null => {
      for (const item of items) {
        if (item.id === asset.ubicacion_id) return item.nombre;
        if (item.hijos) {
          const found = walk(item.hijos as typeof items);
          if (found) return found;
        }
      }
      return null;
    };
    return walk(ubicaciones);
  }, [asset?.ubicacion_id, ubicaciones]);

  const loadAll = async (id: string) => {
    try {
      const a = await getActivo(id);
      setAsset(a);
      const [c, h] = await Promise.all([
        getCatalogArticle(a.articulo_id).catch(() => null as unknown as CatalogArticleResponse),
        getHistorialEstadosActivo(id).catch(() => [] as LogEstadoActivo[]),
      ]);
      if (c) setCatalog(c);
      setHistorial(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar activo');
    } finally {
      setLoading(false);
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    if (!activoId) return;
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
        if (!cancelled) {
          setLoading(false);
          setLoadingHistorial(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activoId]);

  const handleCambiarEstado = async (nuevoEstado: ActivoEstado) => {
    if (!asset) return;
    setCambiandoEstado(true);
    try {
      await updateActivo(asset.id, { estadoInicial: nuevoEstado, version: asset.version });
      await loadAll(asset.id);
      setModalOpen(false);
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'No se pudo cambiar el estado del activo.',
        confirmButtonColor: '#ECA03C',
      });
    } finally {
      setCambiandoEstado(false);
    }
  };

  const estado = asset ? normalizeAssetStatus(asset.estado) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-gema-primary/20 dark:border-white/20 border-t-gema-accent animate-spin" />
      </div>
    );
  }

  if (error || !asset || !estado) {
    return (
      <div className="text-center py-24">
        <p className="text-gema-primary dark:text-white text-lg font-medium">
          {error ?? 'Activo no encontrado.'}
        </p>
        <Link href="/activos" className="mt-4 inline-block text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline">
          Volver a activos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/activos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a activos
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            {asset.serial_interno || 'Sin nombre'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Código {asset.codigo_activo || '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            Cambiar estado
          </button>
          <PermissionGuard module="activos" action="edit">
            <Link
              href={`/activos/${asset.id}/editar`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
              Editar
            </Link>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Código activo</p>
              <p className="font-semibold text-gema-primary dark:text-white">{asset.codigo_activo || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Serial interno</p>
              <p className="font-semibold text-gema-primary dark:text-white">{asset.serial_interno || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Artículo</p>
              <p className="font-semibold text-gema-primary dark:text-white">
                {catalog?.name ? (
                  <Link href={`/catalogo/${asset.articulo_id}`} className="text-gema-accent-dark dark:text-gema-accent hover:underline">
                    {catalog.name}
                  </Link>
                ) : (
                  '—'
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Ubicación</p>
              <p className="font-semibold text-gema-primary dark:text-white">{ubicacionName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Fecha de adquisición</p>
              <p className="font-semibold text-gema-primary dark:text-white">{asset.fecha_adquisicion || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-1">Valor monetario</p>
              <p className="font-semibold text-gema-primary dark:text-white">
                {asset.valor_monetario != null ? `${asset.valor_monetario.toLocaleString('es-VE')} ${asset.moneda}` : '—'}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Estado actual</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-start gap-4">
            <Badge estado={estado as EstadoActivo} className="text-sm px-4 py-2" />
            <p className="text-xs text-gema-primary/50 dark:text-white/40">
              Usa &quot;Cambiar estado&quot; para registrar una transición y dejar constancia en el historial.
            </p>
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gema-accent" strokeWidth={2} />
            <CardTitle>Historial de estados</CardTitle>
          </div>
        </CardHeader>

        {loadingHistorial ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-gema-primary/20 dark:border-white/20 border-t-gema-accent animate-spin" />
          </div>
        ) : historial.length === 0 ? (
          <p className="text-sm text-gema-primary/50 dark:text-white/40 text-center py-4">
            Sin cambios de estado registrados.
          </p>
        ) : (
          <div className="space-y-4">
            {historial.map((log) => (
              <div key={log.id} className="relative pl-6 border-l-2 border-gema-accent/30 last:pb-0 pb-4">
                <div className="absolute -left-1.25 top-1 w-2.5 h-2.5 rounded-full bg-gema-accent" />
                <p className="text-xs text-gema-primary/40 dark:text-white/40">
                  {new Date(log.fecha_cambio).toLocaleString('es')}
                </p>
                <p className="text-sm text-gema-primary dark:text-white/90">
                  <span className="font-semibold">
                    {log.estado_anterior ? ESTADO_OPTIONS.find((o) => o.value === log.estado_anterior)?.label : '—'}
                  </span>
                  {' → '}
                  <span className="font-semibold">
                    {ESTADO_OPTIONS.find((o) => o.value === log.estado_nuevo)?.label ?? log.estado_nuevo}
                  </span>
                </p>
                {log.motivo && <p className="text-xs text-gema-primary/50 dark:text-white/40 italic">&quot;{log.motivo}&quot;</p>}
                <p className="text-xs text-gema-primary/40 dark:text-white/30 mt-0.5">
                  {usuarioMap[log.usuario_id ?? '']?.nombre ?? 'Sistema'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalOpen && (
        <CambiarEstadoModal
          estadoActual={estado}
          isSubmitting={cambiandoEstado}
          onClose={() => setModalOpen(false)}
          onConfirm={handleCambiarEstado}
        />
      )}
    </div>
  );
}
