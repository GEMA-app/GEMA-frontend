'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { RequestState } from '@/components/ui/RequestState';
import { getPlanById } from '@/services/planes-mantenimiento';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import type { PlanMantenimiento } from '@/types/plan-mantenimiento';

const TIPOS = [
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
];

const labelClass = 'block text-[13px] font-semibold text-gema-primary dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent/40';

export default function EditarPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { editarPlan } = usePlanesMantenimiento();
  const { activos } = useActivos({ perPage: 100 });
  const { usuarios } = useUsuarios();
  const tecnicos = usuarios.filter((u) =>
    u.roles.some((r) =>
      r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('tecnico')
    )
  );

  const [plan, setPlan] = useState<PlanMantenimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activoId, setActivoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('preventivo');
  const [intervaloDias, setIntervaloDias] = useState('');
  const [proximaEjecucion, setProximaEjecucion] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getPlanById(id)
      .then((p) => {
        setPlan(p);
        setActivoId(p.activo_id);
        setNombre(p.nombre);
        setTipo(p.tipo);
        setIntervaloDias(String(p.intervalo_dias));
        setProximaEjecucion(p.proxima_ejecucion);
        setTecnicoId(p.tecnico_responsable_id ?? '');
        setDescripcion(p.descripcion_tareas ?? '');
        setActivo(p.activo);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Error al cargar plan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const dias = Number(intervaloDias);
      if (!nombre || !tipo || !dias || !proximaEjecucion) {
        setSaveError('Completa todos los campos obligatorios.');
        return;
      }
      if (dias <= 0) {
        setSaveError('El intervalo debe ser mayor a 0.');
        return;
      }
      setSaving(true);
      setSaveError(null);
      try {
        await editarPlan(id, {
          nombre,
          tipo: tipo as 'preventivo' | 'correctivo' | 'predictivo',
          intervalo_dias: dias,
          proxima_ejecucion: proximaEjecucion,
          tecnico_responsable_id: tecnicoId || undefined,
          descripcion_tareas: descripcion || undefined,
          activo,
        });
        router.push('/mantenimiento/planes');
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Error al guardar.');
      } finally {
        setSaving(false);
      }
    },
    [id, nombre, tipo, intervaloDias, proximaEjecucion, tecnicoId, descripcion, activo, editarPlan, router]
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/mantenimiento/planes"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a planes
        </Link>
      </div>

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Editar plan de mantenimiento
      </h1>

      <RequestState
        loading={loading}
        error={loadError}
        empty={!loading && !loadError && !plan}
        loadingMessage="Cargando plan..."
        emptyMessage="Plan no encontrado."
      >
        {plan && (
          <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
            {saveError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>Activo*</label>
                <select
                  value={activoId}
                  onChange={(e) => setActivoId(e.target.value)}
                  required
                  className={inputClass}
                >
                  {activos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Nombre del plan*</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Tipo*</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Intervalo (días)*</label>
                <input
                  type="number"
                  min="1"
                  value={intervaloDias}
                  onChange={(e) => setIntervaloDias(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Próxima ejecución*</label>
                <input
                  type="date"
                  value={proximaEjecucion}
                  onChange={(e) => setProximaEjecucion(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Técnico responsable</label>
                <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className={inputClass}>
                  <option value="">Sin técnico asignado</option>
                  {tecnicos.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Descripción de tareas</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2 py-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gema-primary/80 dark:text-white/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="accent-gema-accent w-4 h-4 rounded"
                  />
                  Plan activo
                </label>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <Link
                  href="/mantenimiento/planes"
                  className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" strokeWidth={2.5} />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        )}
      </RequestState>
    </div>
  );
}

