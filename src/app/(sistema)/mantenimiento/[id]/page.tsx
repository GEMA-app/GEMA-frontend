'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash, Wrench, Pencil, Box, ClipboardList, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { RequestState } from '@/components/ui/RequestState';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useOrdenDetalle } from '@/hooks/useOrdenDetalle';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useIntervenciones } from '@/hooks/useIntervenciones';
import { updateOrden } from '@/services/ordenes-trabajo';
import { getRepuestos } from '@/services/repuestos';
import { getArticulos } from '@/services/catalogo';
import { createRepuestoUtilizado, deleteRepuestoUtilizado, updateRepuestoUtilizado } from '@/services/repuestos-utilizados';
import { formatEstadoOT, formatTipoMantenimiento, transicionesValidas } from '@/lib/orden-trabajo';

import type { EstadoOT } from '@/types/orden-trabajo';
import type { Repuesto } from '@/types/repuesto';
import type { ArticuloCatalogo } from '@/services/catalogo';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { orden, loading, error, empty, cambiarEstado, asignar, validar, refetch: refetchOrden } = useOrdenDetalle(id);
  const { activos } = useActivos({ perPage: 100 });
  const { usuarios } = useUsuarios();

  const supervisores = useMemo(() => {
    const filtered = usuarios.filter(u => u.roles.some(r => {
      const role = r.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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

  const activoRelacionado = useMemo(
    () => activos.find(a => a.id === orden?.activo_id) ?? null,
    [activos, orden],
  );

  const { intervenciones, loading: loadingInt, error: errorInt, empty: emptyInt, crearIntervencion, eliminarIntervencion, refetch: refetchIntervenciones } = useIntervenciones(id);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  useEffect(() => {
    getRepuestos({}).then(r => setRepuestos(r.repuestos)).catch(() => {});
    getArticulos({}).then(a => setArticulos(a)).catch(() => {});
  }, []);

  const tecnicos = useMemo(() => usuarios.filter(u => u.roles.some(r => r.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('tecnico'))), [usuarios]);
  const usuarioMap = useMemo(() => Object.fromEntries(usuarios.map(u => [u.id, u])), [usuarios]);
  const repuestoMap = useMemo(() => Object.fromEntries(repuestos.map(r => [r.id, r])), [repuestos]);
  const articuloMap = useMemo(() => Object.fromEntries(articulos.map(a => [a.id, a])), [articulos]);

  const repuestosUtilizados = useMemo(
    () =>
      intervenciones.flatMap((intv) =>
        intv.used_parts.map((up, i) => ({ ...up, intervencionId: intv.id, key: up.id || `${intv.id}-${i}` })),
      ),
    [intervenciones],
  );

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
      icon: 'warning',
      title: '¿Estás seguro?',
      text: 'El stock consumido se restaurará en inventario. Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
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

  const labelClass = 'text-xs text-gema-primary/50 dark:text-white/40 mb-1';
  const valueClass = 'font-semibold text-gema-primary dark:text-white';
  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gema-primary dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/mantenimiento"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mantenimiento
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={empty}
        loadingMessage="Cargando orden..."
        emptyMessage="Orden no encontrada."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
              Detalle de Orden de Trabajo
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
              {orden?.codigo_ot || 'Sin código'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !orden}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer w-fit"
          >
            <Save className="w-4 h-4" strokeWidth={2.5} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {saveStatus && (
          <p className={`mb-4 text-sm ${/error/i.test(saveStatus) ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {saveStatus}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card padding="lg" className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información de la orden</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <p className={labelClass}>Código OT</p>
                <p className={valueClass}>{orden?.codigo_ot || '—'}</p>
              </div>
              <div>
                <p className={labelClass}>Estado</p>
                {orden && <Badge estado={orden.estado} />}
              </div>
              <div>
                <p className={labelClass}>Tipo</p>
                <p className={valueClass}>{formatTipoMantenimiento(orden?.tipo ?? '')}</p>
              </div>
              <div>
                <p className={labelClass}>Fecha de apertura</p>
                <p className={valueClass}>
                  {orden?.fecha_apertura ? new Date(orden.fecha_apertura).toLocaleDateString('es-VE') : '—'}
                </p>
              </div>
              <div>
                <label className={`${labelClass} block`} htmlFor="supervisor_id">Supervisor</label>
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
                <label className={`${labelClass} block`}>Técnico asignado</label>
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
              <div className="sm:col-span-2">
                <label className={`${labelClass} block`} htmlFor="descripcion_trabajo">Notas adicionales / instrucciones</label>
                <textarea
                  id="descripcion_trabajo"
                  name="descripcion_trabajo"
                  rows={4}
                  value={form.descripcion_trabajo}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className={`${labelClass} block`} htmlFor="costo_estimado">Costo estimado</label>
                <input
                  id="costo_estimado"
                  name="costo_estimado"
                  type="text"
                  inputMode="decimal"
                  value={form.costo_estimado}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <p className={labelClass}>Costo real</p>
                <p className={valueClass}>{orden?.costo_real ? orden.costo_real.toFixed(2) : '—'}</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <CardHeader>
              <CardTitle>Estado y acciones</CardTitle>
            </CardHeader>
            <div className="flex flex-col items-start gap-4">
              <Badge estado={orden?.estado ?? 'abierta'} className="text-sm px-4 py-2" />

              {orden?.estado !== 'cerrada' && orden?.estado !== 'cancelada' && transicionesValidas(orden?.estado ?? '').length > 0 && (
                <div className="w-full space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gema-primary/50 dark:text-white/40">
                    Cambiar estado
                  </p>
                  {transicionesValidas(orden?.estado ?? '').map((est) => (
                    <button
                      key={est}
                      type="button"
                      onClick={() => cambiarEstado({ estado: est as EstadoOT })}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gema-primary/5 dark:hover:bg-white/10 text-gema-primary dark:text-white font-semibold transition-colors cursor-pointer"
                    >
                      {est === 'cerrada' ? 'Cerrar OT' : formatEstadoOT(est)}
                    </button>
                  ))}
                </div>
              )}

              {orden?.estado === 'cerrada' && !orden?.validado_por_id && (
                <button
                  type="button"
                  onClick={() => validar()}
                  className="w-full text-sm px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
                >
                  Validar orden
                </button>
              )}
              {orden?.validado_por_id && orden?.fecha_validacion && (
                <p className="text-xs text-gema-primary/50 dark:text-white/40">
                  Validada el {new Date(orden.fecha_validacion).toLocaleDateString('es-VE')}
                </p>
              )}
            </div>
          </Card>
        </div>

        <Card padding="lg" className="mb-6 sm:mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Box className="w-5 h-5 text-gema-accent" strokeWidth={2} />
              <CardTitle>Activo relacionado</CardTitle>
            </div>
          </CardHeader>
          {activoRelacionado ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
              <div>
                <p className={labelClass}>Nombre</p>
                <Link
                  href={`/activos/${activoRelacionado.id}`}
                  className="font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline"
                >
                  {activoRelacionado.nombre}
                </Link>
              </div>
              <div>
                <p className={labelClass}>Código</p>
                <p className={valueClass}>{activoRelacionado.serial}</p>
              </div>
              <div>
                <p className={labelClass}>Estado</p>
                <Badge estado={activoRelacionado.estado} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gema-primary/50 dark:text-white/40">Activo no disponible.</p>
          )}
        </Card>

        <Card padding="lg" className="mb-6 sm:mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-gema-accent" strokeWidth={2} />
              <CardTitle>Intervenciones técnicas</CardTitle>
            </div>
            <PermissionGuard module="mantenimiento" action="edit">
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                {showForm ? 'Cancelar' : 'Nueva intervención'}
              </button>
            </PermissionGuard>
          </CardHeader>

          {showForm && (
            <form onSubmit={handleCreateIntervencion} className="rounded-xl bg-gema-bg-light dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 mb-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`${labelClass} block`}>Técnico *</label>
                  <Select
                    value={techId}
                    onChange={(value) => setTechId(value)}
                    options={[{ value: '', label: 'Seleccionar...' }, ...tecnicos.map(u => ({ value: u.id, label: `${u.nombre} (${u.email})` }))]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className={`${labelClass} block`}>Fecha inicio *</label>
                  <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className={`${labelClass} block`}>Horas hombre *</label>
                  <input type="number" min="0" step="0.5" value={horasHombre} onChange={e => setHorasHombre(e.target.value)} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className={`${labelClass} block`}>Tareas realizadas *</label>
                <textarea value={tareas} onChange={e => setTareas(e.target.value)} required rows={3} className={`${inputClass} resize-none`} />
              </div>
              {saveErrorInt && <p className="text-sm text-red-600 dark:text-red-400">{saveErrorInt}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingInt}
                  className="px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {savingInt ? 'Creando...' : 'Crear intervención'}
                </button>
              </div>
            </form>
          )}

          <RequestState
            loading={loadingInt}
            error={errorInt}
            empty={emptyInt}
            loadingMessage="Cargando intervenciones..."
            emptyMessage="No hay intervenciones registradas."
          >
            <div className="space-y-4">
              {intervenciones.map(intv => (
                <div key={intv.id} className="rounded-xl bg-gema-bg-light dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className={labelClass}>Fecha</p>
                      <p className={valueClass}>
                        {new Date(intv.fecha_inicio).toLocaleDateString('es-VE')} — {intv.horas_hombre}h
                      </p>
                    </div>
                    <PermissionGuard module="mantenimiento" action="delete">
                      <button
                        type="button"
                        onClick={() => eliminarIntervencion(intv.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash className="w-4 h-4 text-red-400" />
                      </button>
                    </PermissionGuard>
                  </div>
                  <div className="mb-3">
                    <p className={labelClass}>Técnico</p>
                    <p className={valueClass}>{usuarioMap[intv.technician_id]?.nombre ?? intv.technician_id}</p>
                  </div>
                  <div className="mb-4">
                    <p className={labelClass}>Tareas realizadas</p>
                    <p className="text-sm text-gema-primary/80 dark:text-white/80">{intv.tareas_realizadas}</p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-white/10 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gema-primary/50 dark:text-white/40 uppercase tracking-wider">Repuestos utilizados</span>
                      <PermissionGuard module="inventario" action="edit">
                        <button
                          type="button"
                          onClick={() => setAddingRepuesto(addingRepuesto === intv.id ? null : intv.id)}
                          className="text-xs text-gema-accent-dark dark:text-gema-accent font-semibold hover:underline cursor-pointer"
                        >
                          {addingRepuesto === intv.id ? 'Cancelar' : '+ Agregar repuesto'}
                        </button>
                      </PermissionGuard>
                    </div>

                    {addingRepuesto === intv.id && (
                      <div className="flex items-center gap-2 mb-3 bg-white dark:bg-gema-surface-dark p-3 rounded-xl">
                        <Select
                          value={selRepuesto}
                          onChange={(value) => setSelRepuesto(value)}
                          options={[{ value: '', label: 'Seleccionar...' }, ...repuestos.map(r => ({ value: r.id, label: `${articuloMap[r.articulo_id]?.name ?? r.articulo_id} (stock: ${r.stock_actual})` }))]}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="1"
                          value={cantidad}
                          onChange={e => setCantidad(e.target.value)}
                          placeholder="Cant."
                          className="w-20 px-2 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddRepuesto(intv.id)}
                          className="px-3 py-2 bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Agregar
                        </button>
                      </div>
                    )}

                    {intv.used_parts.length === 0 ? (
                      <p className="text-xs text-gema-primary/40 dark:text-white/40">Sin repuestos</p>
                    ) : (
                      <div className="space-y-1">
                        {intv.used_parts.map((up, i) => {
                          const r = repuestoMap[up.repuesto_id];
                          const nombreRepuesto = r ? (articuloMap[r.articulo_id]?.name ?? r.articulo_id) : up.repuesto_id;
                          const unitCost = up.precio_unitario ?? r?.precio_unitario ?? 0;
                          const totalCost = up.precio_total ?? (unitCost * up.cantidad_usada);
                          return (
                            <div key={up.id || `up-${i}`} className="flex items-center justify-between text-sm text-gema-primary/80 dark:text-white/70 py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
                              <div>
                                <span className="font-medium text-gema-primary dark:text-white">{nombreRepuesto}</span>
                                <span className="text-xs text-gema-primary/50 dark:text-white/40 ml-2">× {up.cantidad_usada}</span>
                                {unitCost > 0 && (
                                  <span className="text-xs text-gema-primary/40 dark:text-white/30 ml-2">
                                    (${unitCost.toFixed(2)} {up.moneda} c/u — Total: ${totalCost.toFixed(2)} {up.moneda})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <PermissionGuard module="inventario" action="edit">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRepuesto(intv.id, up.id, up.cantidad_usada)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                                    title="Editar cantidad"
                                  >
                                    <Pencil className="w-3 h-3 text-gema-accent-dark dark:text-gema-accent" />
                                  </button>
                                </PermissionGuard>
                                <PermissionGuard module="inventario" action="delete">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRepuesto(intv.id, up.id)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                                    title="Eliminar repuesto"
                                  >
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
        </Card>

        {repuestosUtilizados.length > 0 && (
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gema-accent" strokeWidth={2} />
                <CardTitle>Repuestos utilizados</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-1">
              {repuestosUtilizados.map((up) => {
                const r = repuestoMap[up.repuesto_id];
                const nombreRepuesto = r ? (articuloMap[r.articulo_id]?.name ?? r.articulo_id) : up.repuesto_id;
                const unitCost = up.precio_unitario ?? r?.precio_unitario ?? 0;
                const totalCost = up.precio_total ?? (unitCost * up.cantidad_usada);
                return (
                  <div key={up.key} className="flex items-center justify-between text-sm text-gema-primary/80 dark:text-white/70 py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-gema-primary/40 dark:text-white/40" />
                      <span className="font-medium text-gema-primary dark:text-white">{nombreRepuesto}</span>
                      <span className="text-xs text-gema-primary/50 dark:text-white/40">× {up.cantidad_usada}</span>
                    </div>
                    {unitCost > 0 && (
                      <span className="text-xs text-gema-primary/40 dark:text-white/30">
                        ${unitCost.toFixed(2)} {up.moneda} c/u — Total: ${totalCost.toFixed(2)} {up.moneda}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </RequestState>
    </div>
  );
}
