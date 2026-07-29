'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, AlertCircle } from 'lucide-react';
import { getRepuestoById, getMovimientos, createMovimiento } from '@/services/repuestos';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { getEstadoRepuesto } from '../page';
import type { PaginationMeta } from '@/types/common';
import type { Repuesto, MovimientoInventario, TipoMovimiento } from '@/types/repuesto';

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent/40';

export default function InventarioDetallePage() {
  const { id } = useParams<{ id: string }>();

  const [repuesto, setRepuesto] = useState<Repuesto | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [tipoMov, setTipoMov] = useState<TipoMovimiento>('entrada');
  const [reason, setReason] = useState('');
  const [movError, setMovError] = useState<string | null>(null);
  const [submittingMov, setSubmittingMov] = useState(false);
  const [movimientoMeta, setMovimientoMeta] = useState<PaginationMeta | null>(null);
  const [movimientoPage, setMovimientoPage] = useState(1);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [r, result] = await Promise.all([
        getRepuestoById(id),
        getMovimientos(id, 1, 20),
      ]);
      setRepuesto(r);
      setMovimientos(result.movimientos);
      setMovimientoMeta(result.meta);
      setMovimientoPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar repuesto.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [r, result] = await Promise.all([
          getRepuestoById(id),
          getMovimientos(id, 1, 20),
        ]);
        if (cancelled) return;
        setRepuesto(r);
        setMovimientos(result.movimientos);
        setMovimientoMeta(result.meta);
        setMovimientoPage(1);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar repuesto.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleMovimiento = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !Number(cantidad)) return;
    setMovError(null);
    setSubmittingMov(true);
    try {
      await createMovimiento(id, {
        movement_type: tipoMov,
        quantity: Number(cantidad),
        reason: reason.trim() || undefined,
      });
      setCantidad('1');
      setReason('');
      await fetchData();
    } catch (err) {
      setMovError(err instanceof Error ? err.message : 'Error al registrar movimiento');
    } finally {
      setSubmittingMov(false);
    }
  }, [id, cantidad, tipoMov, reason, fetchData]);

  const handleLoadMore = useCallback(async () => {
    if (!id || !movimientoMeta) return;
    const nextPage = movimientoPage + 1;
    try {
      const result = await getMovimientos(id, nextPage, 20);
      setMovimientos(prev => [...prev, ...result.movimientos]);
      setMovimientoMeta(result.meta);
      setMovimientoPage(nextPage);
    } catch (err) {
      console.error('Error al cargar más movimientos:', err);
    }
  }, [id, movimientoPage, movimientoMeta]);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a inventario
          </Link>
        </div>
        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center text-gema-primary/60 dark:text-white/50">
          Cargando repuesto...
        </div>
      </div>
    );
  }

  if (error || !repuesto) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a inventario
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error || 'Repuesto no encontrado'}
        </div>
      </div>
    );
  }

  const estadoRep = getEstadoRepuesto(repuesto.stock_actual, repuesto.stock_minimo);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/inventario"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a inventario
        </Link>
        <Link
          href={`/inventario/${repuesto.id}/editar`}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Pencil className="w-4 h-4" strokeWidth={2} />
          Editar repuesto
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-gema-primary dark:text-white">
                  Repuesto: {repuesto.articulo_nombre || repuesto.articulo_id}
                </h1>
                <Badge estado={estadoRep} />
              </div>
              <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
                Almacén: {repuesto.ubicacion_almacen || 'Sin asignación'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mb-1">Stock actual</p>
              <p className="text-2xl font-extrabold text-gema-primary dark:text-white">{repuesto.stock_actual}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mb-1">Stock mínimo</p>
              <p className="text-2xl font-extrabold text-gema-primary dark:text-white">{repuesto.stock_minimo}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mb-1">Precio unitario</p>
              <p className="text-2xl font-extrabold text-gema-primary dark:text-white">
                {repuesto.moneda} {repuesto.precio_unitario.toLocaleString('es-VE')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gema-primary/80 dark:text-white/80">
            <div>
              <span className="text-xs text-gema-primary/50 dark:text-white/40 block">Ubicación</span>
              <span className="font-semibold">{repuesto.ubicacion_almacen}</span>
            </div>
            <div>
              <span className="text-xs text-gema-primary/50 dark:text-white/40 block">Proveedor</span>
              <span className="font-semibold">{repuesto.proveedor_nombre || repuesto.proveedor_id || 'Sin proveedor'}</span>
            </div>
            <div>
              <span className="text-xs text-gema-primary/50 dark:text-white/40 block">Moneda</span>
              <span className="font-semibold">{repuesto.moneda}</span>
            </div>
          </div>
        </div>

        <PermissionGuard module="inventario" action="create">
          <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="font-heading font-bold text-lg text-gema-primary dark:text-white mb-4">
              Registrar movimiento de stock
            </h2>
            <form onSubmit={handleMovimiento} className="flex flex-wrap items-end gap-4">
              <div>
                <label className={labelClass}>Tipo</label>
                <Select
                  value={tipoMov}
                  onChange={(value) => setTipoMov(value as TipoMovimiento)}
                  options={[
                    { value: 'entrada', label: 'Entrada (+)' },
                    { value: 'salida', label: 'Salida (-)' },
                  ]}
                />
              </div>

              <div>
                <label className={labelClass}>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className={`${inputClass} w-28`}
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className={labelClass}>Motivo / Observación</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Reposición de inventario / Ajuste"
                  className={`${inputClass} w-full`}
                />
              </div>

              <button
                type="submit"
                disabled={submittingMov}
                className="px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
              >
                {submittingMov ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
            {movError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">{movError}</p>
            )}
          </div>
        </PermissionGuard>

        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <h2 className="font-heading font-bold text-lg text-gema-primary dark:text-white mb-4">
            Historial de movimientos
          </h2>
          {movimientos.length === 0 ? (
            <p className="text-sm text-gema-primary/50 dark:text-white/40">Sin movimientos registrados.</p>
          ) : (
            <div className="space-y-3">
              {movimientos.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        m.movement_type === 'entrada'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}
                    >
                      {m.movement_type === 'entrada' ? '+ ENTRADA' : '- SALIDA'}
                    </span>
                    <span className="font-semibold text-gema-primary dark:text-white">
                      {m.quantity} unidades
                    </span>
                    {m.reason && (
                      <span className="text-gema-primary/60 dark:text-white/50">— {m.reason}</span>
                    )}
                  </div>
                  <span className="text-xs text-gema-primary/40 dark:text-white/40">
                    {m.fecha_movimiento ? new Date(m.fecha_movimiento).toLocaleString('es-VE') : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {movimientoMeta && movimientoPage < movimientoMeta.lastPage && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-sm font-medium text-gema-primary/70 dark:text-white/60 transition-colors cursor-pointer"
              >
                Cargar más movimientos ({movimientos.length} de {movimientoMeta.total})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
