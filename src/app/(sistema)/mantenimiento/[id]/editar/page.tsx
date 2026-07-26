'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Calendar, Users, Save, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { getOrdenById, updateOrden } from '@/services/ordenes-trabajo';
import { formatEstadoOT, formatTipoMantenimiento } from '@/lib/orden-trabajo';
import type { TipoMantenimiento, OrdenTrabajo } from '@/types/orden-trabajo';

type Prioridad = 'baja' | 'media' | 'alta';

export default function EditarOrdenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { activos, loading: loadingActivos } = useActivos({ perPage: 200 });
  const { usuarios, loading: loadingUsuarios } = useUsuarios();

  const supervisores = useMemo(() => {
    const filtered = usuarios.filter(u => u.roles.some(r => {
      const role = r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return role.includes('supervisor');
    }));
    return filtered.length > 0 ? filtered : usuarios;
  }, [usuarios]);

  const [orden, setOrden] = useState<OrdenTrabajo | null>(null);
  const [form, setForm] = useState({
    descripcion_trabajo: '',
    supervisor_id: '',
    costo_estimado: '',
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await getOrdenById(id);
        if (cancelled) return;
        setOrden(o);
        setForm({
          descripcion_trabajo: o.descripcion_trabajo ?? '',
          supervisor_id: o.supervisor_id ?? '',
          costo_estimado: o.costo_estimado?.toString() ?? '',
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
    setStatus('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('Guardando...');
    try {
      await updateOrden(id!, {
        descripcion_trabajo: form.descripcion_trabajo || undefined,
        supervisor_id: form.supervisor_id || undefined,
        costo_estimado: form.costo_estimado ? Number(form.costo_estimado) : undefined,
      });
      setStatus('Orden actualizada.');
      setTimeout(() => router.push(`/mantenimiento/${id}`), 800);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Mantenimiento / Editar orden" variant="activos" />
      <p className="text-sm text-gray-500 mt-4">Cargando orden...</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Mantenimiento / Editar orden" variant="activos" />

      <div className="mb-6">
        <Link href={`/mantenimiento/${id}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">EDITAR ORDEN</h2>
            <p className="text-gray-500 text-xs mt-1">{orden?.codigo_ot || 'Modificar orden de trabajo'}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/mantenimiento/${id}`} className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">Cancelar</Link>
            <button type="submit" form="editar-orden-form" disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form id="editar-orden-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">

            {/* Información del activo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Información del activo</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Activo</label>
                <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">
                  {activos.find(a => a.id === orden?.activo_id)?.nombre ?? orden?.activo_id ?? '—'}
                </p>
              </div>
            </div>

            {/* Programación (read-only — no está en update schema) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <Calendar className="w-5 h-5" />
                <span className="text-gray-800">Programación</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha de inicio</label>
                  <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">
                    {orden?.fecha_inicio_trabajo ? new Date(orden.fecha_inicio_trabajo).toLocaleDateString('es-VE') : '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha de fin</label>
                  <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">
                    {orden?.fecha_cierre ? new Date(orden.fecha_cierre).toLocaleDateString('es-VE') : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Asignación */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <Users className="w-5 h-5" />
                <span className="text-gray-800">Asignación</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="supervisor_id">Supervisor</label>
                  <select id="supervisor_id" name="supervisor_id" value={form.supervisor_id} onChange={handleChange}
                    disabled={loadingUsuarios}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                    <option value="">{loadingUsuarios ? 'Cargando...' : 'Sin supervisor'}</option>
                    {supervisores.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Técnico</label>
                  <select disabled
                    className="w-full bg-transparent border-b py-1.5 outline-none text-sm border-gray-300 opacity-60 cursor-not-allowed">
                    <option value="">Asignar desde detalle</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notas adicionales / instrucciones */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Notas adicionales / instrucciones</span>
              </div>
              <textarea id="descripcion_trabajo" name="descripcion_trabajo" rows={4}
                value={form.descripcion_trabajo} onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-transparent p-4 outline-none focus:border-[#E59D12] transition-colors text-sm resize-none shadow-inner" />
            </div>

            {/* Costos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <DollarSign className="w-5 h-5" />
                <span className="text-gray-800">Costos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="costo_estimado">Costo estimado</label>
                  <input id="costo_estimado" name="costo_estimado" type="text" inputMode="decimal"
                    value={form.costo_estimado} onChange={handleChange} placeholder="0.00"
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Costo real</label>
                  <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">
                    {orden?.costo_real ? orden.costo_real.toFixed(2) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {status && <p className={`text-sm ${status.includes('Error') ? 'text-red-600' : 'text-emerald-700'}`}>{status}</p>}
          </form>

          {/* Sidebar */}
          <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100 h-fit space-y-8">
            <div>
              <h3 className="text-gray-800 font-bold text-base mb-5">Tipo de Mantenimiento</h3>
              <div className="space-y-3">
                {['preventivo', 'correctivo', 'predictivo'].map(t => (
                  <div key={t}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 cursor-default transition-all ${(orden?.tipo ?? '') === t ? 'border-[#ECA03C] bg-amber-50/10' : 'border-gray-200 bg-white opacity-50'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${(orden?.tipo ?? '') === t ? 'bg-[#8B4513]' : 'bg-transparent border border-gray-300'}`} />
                    <span className="text-sm text-gray-700 capitalize">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-gray-800 font-bold text-base mb-5">Prioridad</h3>
              <div className="space-y-3">
                {(['baja', 'media', 'alta'] as Prioridad[]).map(p => (
                  <div key={p}
                    className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white opacity-50 px-4 py-3 cursor-default"
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 bg-transparent border border-gray-300" />
                    <span className="text-sm text-gray-700 capitalize">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
