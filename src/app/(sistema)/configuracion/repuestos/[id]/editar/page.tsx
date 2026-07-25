'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { getRepuestoById, updateRepuesto } from '@/services/repuestos';
import type { Repuesto } from '@/types/repuesto';

export default function EditarRepuestoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [repuesto, setRepuesto] = useState<Repuesto | null>(null);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [proveedorId, setProveedorId] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [precio, setPrecio] = useState('0');
  const [moneda, setMoneda] = useState('USD');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await getRepuestoById(id);
        setRepuesto(r);
        setProveedorId(r.proveedor_id ?? '');
        setUbicacion(r.ubicacion_almacen);
        setStockMinimo(String(r.stock_minimo));
        setPrecio(String(r.precio_unitario));
        setMoneda(r.moneda);
      } catch (err) {
        setSubmitStatus(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setLoadingAsset(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repuesto) return;

    const next: Record<string, string> = {};
    if (!ubicacion.trim()) next.ubicacion = 'La ubicación es obligatoria.';
    setErrors(next);
    if (Object.keys(next).length > 0) { setSubmitStatus('Corrige los errores.'); return; }

    setIsSubmitting(true);
    setSubmitStatus('Guardando...');
    try {
      await updateRepuesto(id, {
        proveedor_id: proveedorId || undefined,
        ubicacion_almacen: ubicacion,
        stock_minimo: Number(stockMinimo),
        precio_unitario: Number(precio),
        moneda,
        version: repuesto.version,
      });
      router.push(`/configuracion/repuestos/${id}`);
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAsset) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
        <PageHeader title="Repuestos / Editar repuesto" variant="configuracion" />
        <p className="text-gray-500 text-sm mt-8">Cargando datos del repuesto...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Repuestos / Editar repuesto" variant="configuracion" />

      <div className="mb-6">
        <Link href={`/configuracion/repuestos/${id}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar repuesto</h2>
            <p className="text-gray-500 text-xs mt-1">{repuesto?.articulo_id}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/configuracion/repuestos/${id}`} className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
              Cancelar
            </Link>
            <button type="submit" form="editar-repuesto-form" disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        <form id="editar-repuesto-form" onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Artículo</label>
              <p className="text-sm font-semibold text-gray-900 border-b border-gray-400 py-1.5">{repuesto?.articulo_id}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stock actual</label>
              <p className="text-sm font-semibold text-gray-900 border-b border-gray-400 py-1.5">{repuesto?.stock_actual}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="proveedorId">Proveedor ID</label>
              <input id="proveedorId" type="text" value={proveedorId} onChange={e => setProveedorId(e.target.value)}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="moneda">Moneda</label>
              <select id="moneda" value={moneda} onChange={e => setMoneda(e.target.value)}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                <option value="USD">USD</option>
                <option value="VES">VES</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="ubicacion">Ubicación</label>
              <input id="ubicacion" type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)}
                className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.ubicacion ? 'border-red-500' : 'border-gray-400'}`} />
              {errors.ubicacion && <p className="text-xs text-red-600 mt-1">{errors.ubicacion}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="stockMinimo">Stock mínimo</label>
              <input id="stockMinimo" type="number" min="0" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="precio">Precio unitario</label>
              <input id="precio" type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
            </div>
          </div>

          {submitStatus && (
            <p className={`text-sm ${submitStatus.includes('Error') || submitStatus.includes('error') ? 'text-red-600' : 'text-emerald-700'}`}>{submitStatus}</p>
          )}
        </form>
      </div>
    </div>
  );
}
