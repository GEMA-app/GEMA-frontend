'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, Users, Save, Plus, Trash, Wrench, Pencil } from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { RequestState } from '@/components/ui/RequestState';
import { useOrdenDetalle } from '@/hooks/useOrdenDetalle';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useIntervenciones } from '@/hooks/useIntervenciones';
import { updateOrden } from '@/services/ordenes-trabajo';
import { getRepuestos } from '@/services/repuestos';
import { getArticulos } from '@/services/catalogo';
import { createRepuestoUtilizado, deleteRepuestoUtilizado, updateRepuestoUtilizado } from '@/services/repuestos-utilizados';
import { formatEstadoOT, transicionesValidas } from '@/lib/orden-trabajo';

import type { EstadoOT, OrdenTrabajo } from '@/types/orden-trabajo';
import type { Repuesto } from '@/types/repuesto';
import type { ArticuloCatalogo } from '@/services/catalogo';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';



export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { orden, loading, error, empty, cambiarEstado, asignar, remover, validar, refetch: refetchOrden } = useOrdenDetalle(id);
  const { activos } = useActivos({ perPage: 100 });
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

  const { intervenciones, loading: loadingInt, error: errorInt, empty: emptyInt, crearIntervencion, eliminarIntervencion, refetch: refetchIntervenciones } = useIntervenciones(id);
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
      await refetchIntervenciones();
      await refetchOrden();
      Swal.fire({ icon: 'success', title: 'Repuesto registrado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err instanceof Error ? err.message : 'Error al agregar repuesto.' });
    }
  };

  const handleUpdateRepuesto = async (intervencionId: string, repuestoId: string, currentCantidad: number) => {
    const { value: newCant } = await Swal.fire({
      title: 'Editar cantidad',
      input: 'number',
      inputValue: currentCantidad,
      inputAttributes: { min: '1' },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    });
    if (!newCant || Number(newCant) === currentCantidad) return;
    try {
      await updateRepuestoUtilizado(id, intervencionId, repuestoId, Number(newCant));
      await refetchIntervenciones();
      await refetchOrden();
      Swal.fire({ icon: 'success', title: 'Cantidad actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err instanceof Error ? err.message : 'Error al actualizar repuesto.' });
    }
  };

  const handleDeleteRepuesto = async (intervencionId: string, repuestoId: string) => {
    const res = await Swal.fire({
      title: '¿Eliminar repuesto?',
      text: 'El stock consumido se restaurará en inventario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    });
    if (!res.isConfirmed) return;
    try {
      await deleteRepuestoUtilizado(id, intervencionId, repuestoId);
      await refetchIntervenciones();
      await refetchOrden();
      Swal.fire({ icon: 'success', title: 'Repuesto eliminado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al eliminar repuesto' });
    }
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
              {orden && <Badge estado={orden.estado} />}
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
                    <Select
                      id="supervisor_id"
                      name="supervisor_id"
                      value={form.supervisor_id}
                      onChange={(value) => {
                        setForm(prev => ({ ...prev, supervisor_id: value }));
                        setSaveStatus('');
                      }}
                      options={[{ value: '', label: 'Sin supervisor' }, ...supervisores.map(u => ({ value: u.id, label: u.nombre }))]}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Técnico</label>
                    <Select
                      value={techId}
                      onChange={async (value) => {
                        setTechId(value);
                        if (value) {
                          try {
                            await asignar(value);
                            setSaveStatus('Técnico asignado.');
                          } catch (err) {
                            setSaveStatus(err instanceof Error ? err.message : 'Error al asignar técnico');
                          }
                        }
                      }}
                      options={[{ value: '', label: 'Sin técnico asignado' }, ...tecnicos.map(u => ({ value: u.id, label: `${u.nombre} (${u.email})` }))]}
                      className="w-full"
                    />
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
                <Select
                  value={techId}
                  onChange={(value) => setTechId(value)}
                  options={[{ value: '', label: 'Seleccionar...' }, ...tecnicos.map(u => ({ value: u.id, label: `${u.nombre} (${u.email})` }))]}
                  className="w-full"
                />
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
                    <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">{new Date(intv.fecha_inicio).toLocaleDateString('es-VE')} — {intv.horas_hombre}h</p>
                  </div>
                  <PermissionGuard module="mantenimiento" action="delete">
                    <button type="button" onClick={() => eliminarIntervencion(intv.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                      <Trash className="w-4 h-4 text-red-400" />
                    </button>
                  </PermissionGuard>
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
                    <PermissionGuard module="inventario" action="edit">
                      <button type="button" onClick={() => setAddingRepuesto(addingRepuesto === intv.id ? null : intv.id)}
                        className="text-xs text-[#E59D12] font-semibold hover:underline cursor-pointer">
                        {addingRepuesto === intv.id ? 'Cancelar' : '+ Agregar repuesto'}
                      </button>
                    </PermissionGuard>
                  </div>

                  {addingRepuesto === intv.id && (
                    <div className="flex items-center gap-2 mb-3 bg-gray-50 p-3 rounded-xl">
                      <Select
                        value={selRepuesto}
                        onChange={(value) => setSelRepuesto(value)}
                        options={[{ value: '', label: 'Seleccionar...' }, ...repuestos.map(r => ({ value: r.id, label: `${articuloMap[r.articulo_id]?.name ?? r.articulo_id} (stock: ${r.stock_actual})` }))]}
                        className="flex-1"
                      />
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
                      {intv.used_parts.map((up, i) => {
                        const r = repuestoMap[up.repuesto_id];
                        const nombreRepuesto = r ? (articuloMap[r.articulo_id]?.name ?? r.articulo_id) : up.repuesto_id;
                        const unitCost = up.precio_unitario ?? r?.precio_unitario ?? 0;
                        const totalCost = up.precio_total ?? (unitCost * up.cantidad_usada);
                        return (
                          <div key={up.id || `up-${i}`} className="flex items-center justify-between text-sm text-gray-600 py-1.5 border-b border-gray-100">
                            <div>
                              <span className="font-medium text-gray-800">{nombreRepuesto}</span>
                              <span className="text-xs text-gray-500 ml-2">× {up.cantidad_usada}</span>
                              {unitCost > 0 && (
                                <span className="text-xs text-gray-400 ml-2">
                                  (${unitCost.toFixed(2)} {up.moneda} c/u — Total: ${totalCost.toFixed(2)} {up.moneda})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <PermissionGuard module="inventario" action="edit">
                                <button type="button" onClick={() => handleUpdateRepuesto(intv.id, up.id, up.cantidad_usada)}
                                  className="p-1 hover:bg-gray-100 rounded cursor-pointer" title="Editar cantidad">
                                  <Pencil className="w-3 h-3 text-amber-500" />
                                </button>
                              </PermissionGuard>
                              <PermissionGuard module="inventario" action="delete">
                                <button type="button" onClick={() => handleDeleteRepuesto(intv.id, up.id)}
                                  className="p-1 hover:bg-gray-100 rounded cursor-pointer" title="Eliminar repuesto">
                                  <Trash className="w-3 h-3 text-red-400" />
                                </button>
                              </PermissionGuard>
                            </div>
                          </div>
                        );
                      })}
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
