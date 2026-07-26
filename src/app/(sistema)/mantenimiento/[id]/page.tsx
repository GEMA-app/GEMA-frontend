'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, FileText, Calendar, Users, Save, Plus, Trash, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useOrdenDetalle } from '@/hooks/useOrdenDetalle';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useIntervenciones } from '@/hooks/useIntervenciones';
import { updateOrden } from '@/services/ordenes-trabajo';
import { getRepuestos } from '@/services/repuestos';
import { getArticulos } from '@/services/catalogo';
import { createRepuestoUtilizado, deleteRepuestoUtilizado } from '@/services/repuestos-utilizados';
import { formatEstadoOT, transicionesValidas } from '@/lib/orden-trabajo';
import type { EstadoOT, OrdenTrabajo } from '@/types/orden-trabajo';
import type { Repuesto } from '@/types/repuesto';
import type { ArticuloCatalogo } from '@/services/catalogo';

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
  const { orden, historial, loading, error, empty, cambiarEstado, validar } = useOrdenDetalle(id);
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

  const { intervenciones, loading: loadingInt, error: errorInt, empty: emptyInt, crearIntervencion, eliminarIntervencion } = useIntervenciones(id);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  useEffect(() => {
    getRepuestos({}).then(r => setRepuestos(r.repuestos)).catch(() => {});
    getArticulos({}).then(a => setArticulos(a)).catch(() => {});
  }, []);

  const tecnicos = useMemo(() => usuarios.filter(u => u.roles.some(r => r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('tecnico'))), [usuarios]);
  const usuarioMap = useMemo(() => Object.fromEntries(usuarios.map(u => [u.id, u])), [usuarios]);
  const repuestoMap = useMemo(() => Object.fromEntries(repuestos.map(r => [r.id, r])), [repuestos]);
  const articuloMap = useMemo(() => Object.fromEntries(articulos.map(a => [a.id, a])), [articulos]);

  const [showForm, setShowForm] = useState(false);
  const [techId, setTechId] = useState('');
  const [tareas, setTareas] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horasHombre, setHorasHombre] = useState('');
  const [savingInt, setSavingInt] = useState(false);
  const [saveErrorInt, setSaveErrorInt] = useState<string | null>(null);

  const handleCreateIntervencion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techId || !tareas || !fechaInicio || !horasHombre) { setSaveErrorInt('Completa todos los campos.'); return; }
    setSavingInt(true); setSaveErrorInt(null);
    try {
      await crearIntervencion({ technician_id: techId, tareas_realizadas: tareas, fecha_inicio: fechaInicio, horas_hombre: Number(horasHombre) });
      setShowForm(false); setTechId(''); setTareas(''); setFechaInicio(''); setHorasHombre('');
    } catch (err) { setSaveErrorInt(err instanceof Error ? err.message : 'Error al crear intervención.'); }
    finally { setSavingInt(false); }
  };

  const [addingRepuesto, setAddingRepuesto] = useState<string | null>(null);
  const [selRepuesto, setSelRepuesto] = useState('');
  const [cantidad, setCantidad] = useState('');

  const handleAddRepuesto = async (intervencionId: string) => {
    if (!selRepuesto || !cantidad) return;
    try {
      await createRepuestoUtilizado(id, intervencionId, { repuesto_id: selRepuesto, cantidad_usada: Number(cantidad) });
      setAddingRepuesto(null); setSelRepuesto(''); setCantidad('');
      window.location.reload();
    } catch (err) { alert(err instanceof Error ? err.message : 'Error al agregar repuesto.'); }
  };

  const handleDeleteRepuesto = async (intervencionId: string, repuestoId: string) => {
    if (!window.confirm('¿Eliminar repuesto? El stock se restaurará.')) return;
    try { await deleteRepuestoUtilizado(id, intervencionId, repuestoId); window.location.reload(); }
    catch { alert('Error al eliminar repuesto.'); }
  };

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
              <div>
                <h3 className="text-gray-800 font-bold text-base mb-5">Estado</h3>
                <p className="text-sm font-semibold text-gray-800 mb-3 capitalize">{formatEstadoOT(orden?.estado ?? '')}</p>
                {orden?.estado !== 'cerrada' && orden?.estado !== 'cancelada' && transicionesValidas(orden?.estado ?? '').length > 0 && (
                  <div className="space-y-2">
                    {transicionesValidas(orden?.estado ?? '').map(est => (
                      <button key={est} onClick={() => cambiarEstado({ estado: est as EstadoOT })}
                        className="w-full text-sm px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 capitalize transition-all"
                      >
                        {formatEstadoOT(est)}
                      </button>
                    ))}
                  </div>
                )}
                {orden?.estado === 'cerrada' && !orden?.validado_por_id && (
                  <button onClick={() => validar()}
                    className="w-full mt-3 text-sm px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all"
                  >
                    Validar orden
                  </button>
                )}
                {orden?.validado_por_id && orden?.fecha_validacion && (
                  <p className="text-xs text-gray-500 mt-2">Validada el {new Date(orden.fecha_validacion).toLocaleDateString('es-VE')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </RequestState>

      {/* Historial de cambios de estado */}
      {historial.length > 0 && (
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6 mt-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <div className="border-b-2 border-[#2E4365]/20 pb-4">
            <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
              <Clock className="w-5 h-5" />
              <span className="text-gray-800">Historial de cambios de estado</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {[...historial].sort((a, b) => new Date(b.fecha_cambio).getTime() - new Date(a.fecha_cambio).getTime()).map((h, i) => (
                <div key={h.id} className="relative flex gap-6 pl-10">
                  <div className={`absolute left-[7px] w-[18px] h-[18px] rounded-full border-2 border-white shadow-sm ${i === 0 ? 'bg-[#E59D12]' : 'bg-gray-300'}`} />
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {new Date(h.fecha_cambio).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {h.usuario_id && usuarioMap[h.usuario_id] && (
                        <span className="text-xs text-gray-500">por {usuarioMap[h.usuario_id].nombre}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {h.estado_anterior ? (
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          {formatEstadoOT(h.estado_anterior)}
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">&mdash;</span>
                      )}
                      <span className="text-gray-400 text-sm">&rarr;</span>
                      <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${badgeStyles[formatEstadoOT(h.estado_nuevo)] || 'bg-gray-100 text-gray-600'}`}>
                        {formatEstadoOT(h.estado_nuevo)}
                      </span>
                    </div>
                    {h.motivo && (
                      <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{h.motivo}&rdquo;</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8 mt-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex items-center justify-between border-b-2 border-[#2E4365]/20 pb-4">
          <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
            <Wrench className="w-5 h-5" />
            <span className="text-gray-800">Intervenciones</span>
          </div>
          <button type="button" onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {showForm ? 'Cancelar' : 'Nueva intervención'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateIntervencion} className="rounded-2xl bg-white border border-gray-100 p-6 mb-2 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Técnico *</label>
                <select value={techId} onChange={e => setTechId(e.target.value)} required
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400">
                  <option value="">Seleccionar...</option>
                  {tecnicos.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha inicio *</label>
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Horas hombre *</label>
                <input type="number" min="0" step="0.5" value={horasHombre} onChange={e => setHorasHombre(e.target.value)} required
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tareas realizadas *</label>
              <textarea value={tareas} onChange={e => setTareas(e.target.value)} required rows={3}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400 resize-none" />
            </div>
            {saveErrorInt && <p className="text-sm text-red-600">{saveErrorInt}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={savingInt}
                className="px-6 py-2 bg-[#E59D12] text-black font-bold rounded-full text-sm hover:brightness-95 disabled:opacity-60 transition-all">
                {savingInt ? 'Creando...' : 'Crear intervención'}
              </button>
            </div>
          </form>
        )}

        <RequestState loading={loadingInt} error={errorInt} empty={emptyInt}
          loadingMessage="Cargando intervenciones..." emptyMessage="No hay intervenciones registradas."
        >
          <div className="space-y-4">
            {intervenciones.map(intv => (
              <div key={intv.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                    <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">{new Date(intv.fecha_inicio).toLocaleDateString('es')} — {intv.horas_hombre}h</p>
                  </div>
                  <button type="button" onClick={() => eliminarIntervencion(intv.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Trash className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-1">Técnico</label>
                  <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">{usuarioMap[intv.technician_id]?.nombre ?? intv.technician_id}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-1">Tareas realizadas</label>
                  <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">{intv.tareas_realizadas}</p>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repuestos utilizados</span>
                    <button type="button" onClick={() => setAddingRepuesto(addingRepuesto === intv.id ? null : intv.id)}
                      className="text-xs text-[#E59D12] font-semibold hover:underline cursor-pointer">
                      {addingRepuesto === intv.id ? 'Cancelar' : '+ Agregar repuesto'}
                    </button>
                  </div>

                  {addingRepuesto === intv.id && (
                    <div className="flex items-center gap-2 mb-3 bg-gray-50 p-3 rounded-xl">
                      <select value={selRepuesto} onChange={e => setSelRepuesto(e.target.value)}
                        className="flex-1 bg-transparent border-b py-1 text-sm outline-none border-gray-400">
                        <option value="">Seleccionar...</option>
                        {repuestos.map(r => <option key={r.id} value={r.id}>{articuloMap[r.articulo_id]?.name ?? r.articulo_id} (stock: {r.stock_actual})</option>)}
                      </select>
                      <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cant."
                        className="w-20 bg-transparent border-b py-1 text-sm outline-none border-gray-400" />
                      <button type="button" onClick={() => handleAddRepuesto(intv.id)}
                        className="px-3 py-1.5 bg-[#E59D12] text-black font-bold rounded-full text-xs hover:brightness-95 transition-all cursor-pointer">
                        Agregar
                      </button>
                    </div>
                  )}

                  {intv.used_parts.length === 0 ? (
                    <p className="text-xs text-gray-400">Sin repuestos</p>
                  ) : (
                    <div className="space-y-1">
                      {intv.used_parts.map((up, i) => (
                        <div key={up.id || `up-${i}`} className="flex items-center justify-between text-sm text-gray-600 py-1.5 border-b border-gray-100">
                          <span>{(() => { const r = repuestoMap[up.repuesto_id]; return r ? (articuloMap[r.articulo_id]?.name ?? r.articulo_id) : up.repuesto_id; })()} × {up.cantidad_usada}</span>
                          <button type="button" onClick={() => handleDeleteRepuesto(intv.id, up.id)}
                            className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                            <Trash className="w-3 h-3 text-red-300" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </RequestState>
      </div>
    </div>
  );
}
