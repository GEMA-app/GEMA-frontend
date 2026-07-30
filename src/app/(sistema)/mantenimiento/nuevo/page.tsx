'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';

import { ArrowLeft, FileText, Calendar, Users, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { createOrden, asignarTecnico } from '@/services/ordenes-trabajo';
import type { TipoMantenimiento } from '@/types/orden-trabajo';
import { Select } from '@/components/ui/Select';
import { HelpTip } from '@/components/ui/HelpTip';

type Prioridad = 'baja' | 'media' | 'alta';

const initialFormState = {
  activo_id: '',
  tipo: '' as TipoMantenimiento | '',
  prioridad: '' as Prioridad | '',
  supervisor_id: '',
  tecnico_id: '',
  notas: '',
  fecha_inicio_trabajo: '',
  fecha_cierre: '',
};

const labelClass = 'block text-[13px] font-semibold text-gema-primary dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent/40';

function NuevaOrdenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fechaParam = searchParams.get('fecha');

  const { activos, loading: loadingActivos } = useActivos({ perPage: 200 });
  const { usuarios, loading: loadingUsuarios } = useUsuarios();

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (fechaParam) {
      setFormData((prev) => ({ ...prev, fecha_inicio_trabajo: fechaParam }));
    }
  }, [fechaParam]);

  const supervisores = useMemo(
    () => {
      const filtered = usuarios.filter(u => u.roles.some(r => {
        const role = r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return role.includes('supervisor');
      }));
      return filtered.length > 0 ? filtered : usuarios;
    },
    [usuarios],
  );

  const tecnicos = useMemo(
    () => {
      const filtered = usuarios.filter(u => u.roles.some(r => {
        const role = r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return role.includes('tecnico');
      }));
      return filtered.length > 0 ? filtered : usuarios;
    },
    [usuarios],
  );

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
      const orden = await createOrden({
        activo_id: formData.activo_id,
        tipo: formData.tipo as TipoMantenimiento,
        supervisor_id: formData.supervisor_id || undefined,
        descripcion_trabajo: formData.notas || undefined,
      });

      if (formData.tecnico_id) {
        await asignarTecnico(orden.id, formData.tecnico_id);
      }

      setSubmitStatus('Orden creada correctamente.');
      setTimeout(() => router.push('/mantenimiento'), 800);
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Error al crear la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Nueva orden de trabajo
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form id="nueva-orden-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

            {/* Información del activo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gema-accent font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gema-primary dark:text-white">Información del activo</span>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1.5`} htmlFor="activo_id">
                  Activo*
                  <HelpTip
                    title="¿No aparece el activo?"
                    message="Solo se muestran activos registrados en el sistema. Ve a Activos → Nuevo activo para registrarlo primero."
                  />
                </label>
                <Select
                  id="activo_id"
                  name="activo_id"
                  value={formData.activo_id}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, activo_id: value }));
                    setErrors(prev => ({ ...prev, activo_id: '' }));
                    setSubmitStatus('');
                  }}
                  disabled={loadingActivos}
                  options={[{ value: '', label: loadingActivos ? 'Cargando activos...' : 'Seleccione un activo' }, ...activos.map(a => ({ value: a.id, label: a.nombre }))]}
                  className={`w-full ${errors.activo_id ? 'ring-1 ring-red-500 rounded-xl' : ''}`}
                />
                {errors.activo_id && <p className="text-xs text-red-500 mt-1">{errors.activo_id}</p>}
              </div>
            </div>

            {/* Programación */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gema-accent font-semibold text-base">
                <Calendar className="w-5 h-5" />
                <span className="text-gema-primary dark:text-white">Programación</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="fecha_inicio_trabajo">Fecha de inicio</label>
                  <input
                    id="fecha_inicio_trabajo"
                    name="fecha_inicio_trabajo"
                    type="date"
                    value={formData.fecha_inicio_trabajo}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="fecha_cierre">Fecha de fin</label>
                  <input
                    id="fecha_cierre"
                    name="fecha_cierre"
                    type="date"
                    value={formData.fecha_cierre}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Asignación */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gema-accent font-semibold text-base">
                <Users className="w-5 h-5" />
                <span className="text-gema-primary dark:text-white">Asignación</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="supervisor_id">Supervisor</label>
                  <Select
                    id="supervisor_id"
                    name="supervisor_id"
                    value={formData.supervisor_id}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, supervisor_id: value }));
                      setErrors(prev => ({ ...prev, supervisor_id: '' }));
                      setSubmitStatus('');
                    }}
                    disabled={loadingUsuarios}
                    options={[{ value: '', label: loadingUsuarios ? 'Cargando usuarios...' : 'Sin supervisor' }, ...supervisores.map(u => ({ value: u.id, label: u.nombre }))]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className={`${labelClass} flex items-center gap-1.5`} htmlFor="tecnico_id">
                    Técnico
                    <HelpTip
                      title="¿No aparece el técnico?"
                      message="Solo aparecen usuarios con rol Técnico de Mantenimiento. Ve a Usuarios → Nuevo usuario para agregarlo."
                    />
                  </label>
                  <Select
                    id="tecnico_id"
                    name="tecnico_id"
                    value={formData.tecnico_id}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, tecnico_id: value }));
                      setErrors(prev => ({ ...prev, tecnico_id: '' }));
                      setSubmitStatus('');
                    }}
                    disabled={loadingUsuarios}
                    options={[{ value: '', label: loadingUsuarios ? 'Cargando usuarios...' : 'Sin técnico asignado' }, ...tecnicos.map(u => ({ value: u.id, label: u.nombre }))]}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Notas adicionales */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gema-accent font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gema-primary dark:text-white">Notas adicionales / instrucciones</span>
              </div>
              <div>
                <textarea
                  id="notas"
                  name="notas"
                  rows={4}
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Escribe instrucciones o detalles adicionales de la orden..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {submitStatus && (
              <p className={`text-sm ${Object.keys(errors).length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{submitStatus}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
              <Link
                href="/mantenimiento"
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" strokeWidth={2.5} />
                {isSubmitting ? 'Guardando...' : 'Crear orden'}
              </button>
            </div>
          </form>

          {/* Panel lateral: tipo de mantenimiento y prioridad */}
          <div className="rounded-2xl p-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-6">
            <div>
              <h3 className="text-gema-primary dark:text-white font-bold text-sm mb-4">Tipo de Mantenimiento*</h3>
              <div className="space-y-2">
                {['preventivo', 'correctivo', 'predictivo'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, tipo: t as TipoMantenimiento }));
                      setErrors(prev => ({ ...prev, tipo: '' }));
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer text-left transition-all text-sm ${
                      formData.tipo === t
                        ? 'border-gema-accent bg-gema-accent/10 text-gema-primary dark:text-white font-semibold'
                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark text-gema-primary/70 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${formData.tipo === t ? 'bg-gema-accent' : 'bg-transparent border border-gray-300 dark:border-white/30'}`} />
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
              {errors.tipo && <p className="text-xs text-red-500 mt-2">{errors.tipo}</p>}
            </div>

            <div>
              <h3 className="text-gema-primary dark:text-white font-bold text-sm mb-4">Prioridad</h3>
              <div className="space-y-2">
                {(['baja', 'media', 'alta'] as Prioridad[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, prioridad: p }))}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer text-left transition-all text-sm ${
                      formData.prioridad === p
                        ? 'border-gema-accent bg-gema-accent/10 text-gema-primary dark:text-white font-semibold'
                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark text-gema-primary/70 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${formData.prioridad === p ? 'bg-gema-accent' : 'bg-transparent border border-gray-300 dark:border-white/30'}`} />
                    <span className="capitalize">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NuevaOrdenPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gema-primary/50 dark:text-white/50">Cargando...</div>}>
      <NuevaOrdenContent />
    </Suspense>
  );
}
