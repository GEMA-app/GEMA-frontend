'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { getArticulos, type ArticuloCatalogo } from '@/services/catalogo';
import { useProveedores } from '@/hooks/useProveedores';
import { useRepuestos } from '@/hooks/useRepuestos';
import type { Proveedor } from '@/types/proveedor';

const initialFormState = {
  articuloId: '',
  proveedorId: '',
  ubicacion: '',
  stockActual: '0',
  stockMinimo: '0',
  precioUnitario: '0',
  moneda: 'USD',
};

export default function NuevoRepuestoPage() {
  const router = useRouter();
  const { crearRepuesto } = useRepuestos();
  const { proveedores } = useProveedores();
  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getArticulos().then(setArticulos).catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.articuloId) next.articuloId = 'Selecciona un artículo.';
    if (!formData.ubicacion.trim()) next.ubicacion = 'La ubicación es obligatoria.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) { setSubmitStatus('Corrige los errores antes de guardar.'); return; }

    setIsSubmitting(true);
    setSubmitStatus('Guardando...');
    try {
      await crearRepuesto({
        articulo_id: formData.articuloId,
        proveedor_id: formData.proveedorId,
        ubicacion_almacen: formData.ubicacion,
        stock_actual: Number(formData.stockActual),
        stock_minimo: Number(formData.stockMinimo),
        precio_unitario: Number(formData.precioUnitario),
        moneda: formData.moneda,
      });
      router.push('/repuestos');
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Repuestos / Nuevo repuesto" variant="configuracion" />

      <div className="mb-6">
        <Link href="/repuestos" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a repuestos
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrar nuevo repuesto</h2>
            <p className="text-gray-500 text-xs mt-1">Complete los datos para agregar un repuesto al inventario.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/repuestos" className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
              Cancelar
            </Link>
            <button type="submit" form="nuevo-repuesto-form" disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'Guardar repuesto'}
            </button>
          </div>
        </div>

        <form id="nuevo-repuesto-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="articuloId">Artículo</label>
              <select id="articuloId" name="articuloId" value={formData.articuloId} onChange={handleInputChange}
                className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.articuloId ? 'border-red-500' : 'border-gray-400'}`}>
                <option value="">Seleccionar artículo</option>
                {articulos.map(a => (
                  <option key={a.id} value={a.id}>{a.name}{a.model ? ` (${a.model})` : ''}</option>
                ))}
              </select>
              {errors.articuloId && <p className="text-xs text-red-600 mt-1">{errors.articuloId}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="proveedorId">Proveedor</label>
              <select id="proveedorId" name="proveedorId" value={formData.proveedorId} onChange={handleInputChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                <option value="">Sin proveedor</option>
                {proveedores.map((p: Proveedor) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="ubicacion">Ubicación en almacén</label>
              <input id="ubicacion" name="ubicacion" type="text" value={formData.ubicacion} onChange={handleInputChange}
                className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.ubicacion ? 'border-red-500' : 'border-gray-400'}`} />
              {errors.ubicacion && <p className="text-xs text-red-600 mt-1">{errors.ubicacion}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="moneda">Moneda</label>
              <select id="moneda" name="moneda" value={formData.moneda} onChange={handleInputChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                <option value="USD">USD</option>
                <option value="VES">VES</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="stockActual">Stock inicial</label>
              <input id="stockActual" name="stockActual" type="number" min="0" value={formData.stockActual} onChange={handleInputChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="stockMinimo">Stock mínimo</label>
              <input id="stockMinimo" name="stockMinimo" type="number" min="0" value={formData.stockMinimo} onChange={handleInputChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="precioUnitario">Precio unitario</label>
              <input id="precioUnitario" name="precioUnitario" type="number" min="0" step="0.01" value={formData.precioUnitario} onChange={handleInputChange}
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
