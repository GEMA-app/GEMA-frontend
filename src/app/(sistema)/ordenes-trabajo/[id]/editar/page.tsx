'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUsuariosMap } from '@/hooks/useUsuariosMap';
import { getOrdenById, updateOrden } from '@/services/ordenes-trabajo';

export default function EditarOrdenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuariosMap, loadingUsuarios } = useUsuariosMap();

  const supervisores = useMemo(
    () => Array.from(usuariosMap.entries()).map(([uid, nombre]) => ({ id: uid, nombre })),
    [usuariosMap],
  );

  const [form, setForm] = useState({
    descripcion_trabajo: '',
    costo_estimado: '',
    costo_real: '',
    supervisor_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await getOrdenById(id);
        if (cancelled) return;
        setForm({
          descripcion_trabajo: o.descripcion_trabajo ?? '',
          costo_estimado: o.costo_estimado?.toString() ?? '',
          costo_real: o.costo_real?.toString() ?? '',
          supervisor_id: o.supervisor_id ?? '',
        });
      } catch (err) {
        if (!cancelled) setStatus(err instanceof Error ? err.message : 'Error al cargar la orden');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setStatus('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('Guardando...');
    try {
      await updateOrden(id!, {
        descripcion_trabajo: form.descripcion_trabajo || undefined,
        costo_estimado: form.costo_estimado ? Number(form.costo_estimado) : undefined,
        costo_real: form.costo_real ? Number(form.costo_real) : undefined,
        supervisor_id: form.supervisor_id || undefined,
      });
      setStatus('Orden actualizada.');
      setTimeout(() => router.push(`/ordenes-trabajo/${id}`), 800);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Órdenes de Trabajo / Editar" variant="activos" />
      <p className="text-sm text-gray-500 mt-4">Cargando orden...</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Órdenes de Trabajo / Editar" variant="activos" />

      <div className="mb-6">
        <Link href={`/ordenes-trabajo/${id}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Orden de Trabajo</h2>
            <p className="text-gray-500 text-xs mt-1">Sólo los campos indicados pueden modificarse.</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/ordenes-trabajo/${id}`} className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">Cancelar</Link>
            <button type="submit" form="editar-orden-form" disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        <form id="editar-orden-form" onSubmit={handleSubmit} className="max-w-xl space-y-8">

          {/* Supervisor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
              <FileText className="w-5 h-5" />
              <span className="text-gray-800">Asignación</span>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="supervisor_id">Supervisor</label>
              <select id="supervisor_id" name="supervisor_id" value={form.supervisor_id} onChange={handleChange}
                disabled={loadingUsuarios}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                <option value="">{loadingUsuarios ? 'Cargando...' : 'Sin supervisor'}</option>
                {supervisores.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
              <FileText className="w-5 h-5" />
              <span className="text-gray-800">Descripción del Trabajo</span>
            </div>
            <textarea id="descripcion_trabajo" name="descripcion_trabajo" rows={4}
              value={form.descripcion_trabajo} onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-transparent p-4 outline-none focus:border-[#E59D12] transition-colors text-sm resize-none shadow-inner" />
          </div>

          {/* Costos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
              <FileText className="w-5 h-5" />
              <span className="text-gray-800">Costos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="costo_estimado">Costo Estimado</label>
                <input id="costo_estimado" name="costo_estimado" type="text" inputMode="decimal"
                  value={form.costo_estimado} onChange={handleChange} placeholder="0.00"
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="costo_real">Costo Real</label>
                <input id="costo_real" name="costo_real" type="text" inputMode="decimal"
                  value={form.costo_real} onChange={handleChange} placeholder="0.00"
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
              </div>
            </div>
          </div>

          {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}
          {status && <p className={`text-sm ${status.includes('Error') ? 'text-red-600' : 'text-emerald-700'}`}>{status}</p>}
        </form>
      </div>
    </div>
  );
}
