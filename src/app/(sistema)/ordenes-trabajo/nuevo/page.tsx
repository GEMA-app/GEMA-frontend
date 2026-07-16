'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, FileText, Save, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useActivos } from '@/hooks/useActivos';
import { useUsuariosMap } from '@/hooks/useUsuariosMap';
import { createOrden } from '@/services/ordenes-trabajo';
import type { TipoMantenimiento } from '@/types/orden-trabajo';

const initialFormState = {
  codigo_ot: '',
  activo_id: '',
  tipo: '' as TipoMantenimiento | '',
  supervisor_id: '',
  descripcion_trabajo: '',
  costo_estimado: '',
  moneda: 'USD',
};

export default function NuevaOrdenPage() {
  const router = useRouter();
  const { activos, loading: loadingActivos } = useActivos({ perPage: 200 });
  const { usuariosMap, loadingUsuarios } = useUsuariosMap();

  const supervisores = useMemo(
    () => Array.from(usuariosMap.entries()).map(([id, nombre]) => ({ id, nombre })),
    [usuariosMap],
  );

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.activo_id) next.activo_id = 'Debe seleccionar un activo.';
    if (!formData.tipo) next.tipo = 'Debe seleccionar un tipo de mantenimiento.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validateForm();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitStatus('Por favor corrige los errores antes de guardar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Guardando...');
    try {
      await createOrden({
        activo_id: formData.activo_id,
        tipo: formData.tipo as TipoMantenimiento,
        codigo_ot: formData.codigo_ot || undefined,
        supervisor_id: formData.supervisor_id || undefined,
        descripcion_trabajo: formData.descripcion_trabajo || undefined,
        costo_estimado: formData.costo_estimado ? Number(formData.costo_estimado) : undefined,
        moneda: formData.moneda,
      });
      setSubmitStatus('Orden creada correctamente.');
      setTimeout(() => router.push('/ordenes-trabajo'), 800);
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Error al crear la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Órdenes de Trabajo / Nueva orden" variant="activos" />

      <div className="mb-6">
        <Link href="/ordenes-trabajo" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nueva Orden de Trabajo</h2>
            <p className="text-gray-500 text-xs mt-1">Complete los datos para crear una orden de trabajo.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/ordenes-trabajo" className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">Cancelar</Link>
            <button type="submit" form="nueva-orden-form" disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'Crear orden'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form id="nueva-orden-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">

            {/* Sección: Información General */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Información General</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="codigo_ot">Código OT</label>
                  <input id="codigo_ot" name="codigo_ot" type="text" value={formData.codigo_ot} onChange={handleInputChange}
                    placeholder="Opcional — se generará automáticamente"
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="activo_id">Activo *</label>
                  <select id="activo_id" name="activo_id" value={formData.activo_id} onChange={handleInputChange}
                    disabled={loadingActivos}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.activo_id ? 'border-red-500' : 'border-gray-400'}`}>
                    <option value="">{loadingActivos ? 'Cargando activos...' : 'Seleccione un activo'}</option>
                    {activos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  {errors.activo_id && <p className="text-xs text-red-600 mt-1">{errors.activo_id}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="tipo">Tipo de Mantenimiento *</label>
                  <select id="tipo" name="tipo" value={formData.tipo} onChange={handleInputChange}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.tipo ? 'border-red-500' : 'border-gray-400'}`}>
                    <option value="">Seleccione un tipo</option>
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="predictivo">Predictivo</option>
                  </select>
                  {errors.tipo && <p className="text-xs text-red-600 mt-1">{errors.tipo}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="supervisor_id">Supervisor</label>
                  <select id="supervisor_id" name="supervisor_id" value={formData.supervisor_id} onChange={handleInputChange}
                    disabled={loadingUsuarios}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                    <option value="">{loadingUsuarios ? 'Cargando usuarios...' : 'Sin supervisor asignado'}</option>
                    {supervisores.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección: Detalles del Trabajo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Detalles del Trabajo</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="descripcion_trabajo">Descripción del trabajo</label>
                <textarea id="descripcion_trabajo" name="descripcion_trabajo" rows={4}
                  value={formData.descripcion_trabajo} onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 bg-transparent p-4 outline-none focus:border-[#E59D12] transition-colors text-sm resize-none shadow-inner" />
              </div>
            </div>

            {/* Sección: Costos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <Calendar className="w-5 h-5" />
                <span className="text-gray-800">Costos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="costo_estimado">Costo Estimado</label>
                  <input id="costo_estimado" name="costo_estimado" type="text" inputMode="decimal"
                    value={formData.costo_estimado} onChange={handleInputChange} placeholder="0.00"
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="moneda">Moneda</label>
                  <select id="moneda" name="moneda" value={formData.moneda} onChange={handleInputChange}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="VES">VES</option>
                  </select>
                </div>
              </div>
            </div>

            {submitStatus && (
              <p className={`text-sm ${Object.keys(errors).length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>{submitStatus}</p>
            )}
          </form>

          {/* Panel lateral: resumen visual */}
          <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100 h-fit">
            <h3 className="text-gray-800 font-bold text-base mb-5">Tipo de Mantenimiento</h3>
            <div className="space-y-3">
              {['preventivo', 'correctivo', 'predictivo'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tipo: t as TipoMantenimiento }));
                    setErrors(prev => ({ ...prev, tipo: '' }));
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer text-left transition-all ${formData.tipo === t ? 'border-[#ECA03C] bg-amber-50/10' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${formData.tipo === t ? 'bg-[#8B4513]' : 'bg-transparent border border-gray-300'}`} />
                  <span className="text-sm text-gray-700 capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
