'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, Users, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useOrdenDetalle } from '@/hooks/useOrdenDetalle';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { updateOrden } from '@/services/ordenes-trabajo';
import { formatEstadoOT } from '@/lib/orden-trabajo';
import type { OrdenTrabajo } from '@/types/orden-trabajo';

const badgeStyles: Record<string, string> = {
  Abierta: 'bg-[#E3F2FD] text-[#1565C0]',
  'En progreso': 'bg-[#FFF3E0] text-[#E65100]',
  Pausada: 'bg-[#F3E5F5] text-[#6A1B9A]',
  Cerrada: 'bg-[#E8F5E9] text-[#2E7D32]',
  Cancelada: 'bg-[#FCE4EC] text-[#C62828]',
};

function EstadoBadge({ estado }: { estado: string }) {
  const s = badgeStyles[estado] || 'bg-gray-100 text-gray-600';
  return <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${s}`}>{estado}</span>;
}

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { orden, loading, error, empty } = useOrdenDetalle(id);
  const { activos } = useActivos({ perPage: 200 });
  const { usuarios } = useUsuarios();

  const supervisores = useMemo(() => {
    const filtered = usuarios.filter(u => u.roles.some(r => {
      const role = r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return role.includes('supervisor');
    }));
    return filtered.length > 0 ? filtered : usuarios;
  }, [usuarios]);

  const [form, setForm] = useState({ supervisor_id: '', descripcion_trabajo: '', costo_estimado: '' });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (!orden) return;
    setForm({
      supervisor_id: orden.supervisor_id ?? '',
      descripcion_trabajo: orden.descripcion_trabajo ?? '',
      costo_estimado: orden.costo_estimado?.toString() ?? '',
    });
  }, [orden]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSaveStatus('');
  };

  const handleSave = async () => {
    if (!orden) return;
    setSaving(true);
    setSaveStatus('Guardando...');
    try {
      await updateOrden(id!, {
        descripcion_trabajo: form.descripcion_trabajo || undefined,
        supervisor_id: form.supervisor_id || undefined,
        costo_estimado: form.costo_estimado ? Number(form.costo_estimado) : undefined,
      });
      setSaveStatus('Cambios guardados.');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const activoNombre = useMemo(
    () => activos.find(a => a.id === orden?.activo_id)?.nombre ?? orden?.activo_id ?? '—',
    [activos, orden],
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Órdenes de Trabajo / Detalle" variant="activos" />

      <div className="mb-6">
        <Link href="/mantenimiento" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <RequestState loading={loading} error={error} empty={empty}
        loadingMessage="Cargando orden..." emptyMessage="Orden no encontrada."
      >
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{orden?.codigo_ot || 'Sin código'}</h2>
              {orden && <EstadoBadge estado={formatEstadoOT(orden.estado)} />}
            </div>
            <button onClick={handleSave} disabled={saving || !orden}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

          {saveStatus && (
            <p className={`text-sm ${saveStatus.includes('Error') ? 'text-red-600' : 'text-emerald-700'}`}>{saveStatus}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">

              {/* Información del activo */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                  <FileText className="w-5 h-5" />
                  <span className="text-gray-800">Información del activo</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Activo</label>
                  <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">{activoNombre}</p>
                </div>
              </div>

              {/* Programación */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                  <Calendar className="w-5 h-5" />
                  <span className="text-gray-800">Programación</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fecha de inicio</label>
                    <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">
                      {orden?.fecha_inicio_trabajo ? new Date(orden.fecha_inicio_trabajo + 'T00:00:00').toLocaleDateString('es-VE', { timeZone: 'UTC' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fecha de fin</label>
                    <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">
                      {orden?.fecha_cierre ? new Date(orden.fecha_cierre + 'T00:00:00').toLocaleDateString('es-VE', { timeZone: 'UTC' }) : '—'}
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
                      className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                      <option value="">Sin supervisor</option>
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
                  <FileText className="w-5 h-5" />
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
            </div>

            {/* Sidebar */}
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100 h-fit space-y-8">
              <div>
                <h3 className="text-gray-800 font-bold text-base mb-5">Tipo de Mantenimiento</h3>
                <div className="space-y-3">
                  {['preventivo', 'correctivo', 'predictivo'].map(t => (
                    <div key={t}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 cursor-default transition-all ${(orden?.tipo ?? '') === t ? 'border-[#ECA03C] bg-amber-50/10' : 'border-gray-200 bg-white'}`}
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
                  {['baja', 'media', 'alta'].map(p => (
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
      </RequestState>
    </div>
  );
}
