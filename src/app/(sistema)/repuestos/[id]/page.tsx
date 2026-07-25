'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { getRepuestoById, getMovimientos, createMovimiento } from '@/services/repuestos';
import { stockBajo } from '@/lib/repuestos';
import type { Repuesto, MovimientoInventario, TipoMovimiento } from '@/types/repuesto';

export default function RepuestoDetallePage() {
  const { id } = useParams<{ id: string }>();

  const [repuesto, setRepuesto] = useState<Repuesto | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [tipoMov, setTipoMov] = useState<TipoMovimiento>('entrada');
  const [reason, setReason] = useState('');
  const [movError, setMovError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [r, m] = await Promise.all([
        getRepuestoById(id),
        getMovimientos(id),
      ]);
      setRepuesto(r);
      setMovimientos(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar repuesto.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleMovimiento = useCallback(async () => {
    if (!id || !Number(cantidad)) return;
    setMovError(null);
    try {
      await createMovimiento(id, {
        movement_type: tipoMov,
        quantity: Number(cantidad),
        reason: reason || undefined,
      });
      setCantidad('1');
      setReason('');
      await fetchData();
    } catch (err) {
      setMovError(err instanceof Error ? err.message : 'Error al registrar movimiento');
    }
  }, [id, cantidad, tipoMov, reason, fetchData]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader title="Repuestos / Ficha de repuesto" variant="configuracion" />

      <div className="mb-6">
        <Link href="/repuestos" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a repuestos
        </Link>
      </div>

      <RequestState loading={loading} error={error} empty={!loading && !error && !repuesto}
        loadingMessage="Cargando repuesto..." emptyMessage="Repuesto no encontrado."
      >
        {repuesto && (
          <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
            <div className="flex flex-col gap-3 border-b border-[#2E4365]/20 pb-4">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{repuesto.articulo_id}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    stockBajo(repuesto) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {stockBajo(repuesto) ? 'Stock bajo' : 'Stock OK'}
                  </span>
                </div>
                <Link href={`/repuestos/${repuesto.id}/editar`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E59D12] text-black font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
                  <Pencil className="w-4 h-4" strokeWidth={2} />
                  Editar
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Stock actual', value: repuesto.stock_actual, border: '#0A8E71' },
                  { label: 'Stock mínimo', value: repuesto.stock_minimo, border: '#FF0000' },
                  { label: 'Precio unitario', value: `${repuesto.moneda} ${repuesto.precio_unitario}`, border: '#0066FF' },
                ].map(item => (
                  <div key={item.label} className="rounded-[20px] bg-[#EBDDC5] p-6 flex flex-col justify-between min-h-[120px] shadow-md" style={{ border: `2px solid ${item.border}` }}>
                    <p className="text-[10px] font-bold text-gray-900 tracking-wider uppercase">{item.label}</p>
                    <p className="text-4xl font-bold text-black">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 mt-2">
                <div><p className="text-xs text-gray-500 mb-1">Ubicación</p><p className="font-semibold">{repuesto.ubicacion_almacen}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Proveedor</p><p className="font-semibold">{repuesto.proveedor_id || 'Sin proveedor'}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Moneda</p><p className="font-semibold">{repuesto.moneda}</p></div>
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Registrar movimiento</h3>
              <div className="flex items-end gap-4 flex-wrap">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Tipo</label>
                  <select value={tipoMov} onChange={e => setTipoMov(e.target.value as TipoMovimiento)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none">
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Cantidad</label>
                  <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)}
                    className="w-24 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none" />
                </div>
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <label className="text-xs text-gray-500">Motivo</label>
                  <input value={reason} onChange={e => setReason(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none" />
                </div>
                <button onClick={handleMovimiento}
                  className="px-5 py-2 rounded-xl bg-[#E59D12] text-black font-semibold text-sm">
                  Registrar
                </button>
              </div>
              {movError && <p className="text-xs text-red-600 mt-2">{movError}</p>}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Historial de movimientos</h3>
              {movimientos.length === 0 ? (
                <p className="text-sm text-gray-500">Sin movimientos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {movimientos.map(m => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          m.movement_type === 'entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {m.movement_type === 'entrada' ? '+ENT' : '-SAL'}
                        </span>
                        <span className="text-sm text-gray-900 font-medium">{m.quantity} unidades</span>
                        {m.reason && <span className="text-sm text-gray-500">{m.reason}</span>}
                      </div>
                      <span className="text-xs text-gray-400">
                        {m.fecha_movimiento ? new Date(m.fecha_movimiento).toLocaleString('es-VE') : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </RequestState>
    </div>
  );
}
