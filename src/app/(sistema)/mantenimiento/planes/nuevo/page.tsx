'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Select } from '@/components/ui/Select';

const TIPOS = [
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
];

const labelClass = 'block text-[13px] font-semibold text-gema-primary dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent/40';

export default function NuevoPlanPage() {
  const router = useRouter();
  const { crearPlan } = usePlanesMantenimiento();
  const { activos } = useActivos({ perPage: 100 });
  const { usuarios } = useUsuarios();
  const tecnicos = usuarios.filter((u) =>
    u.roles.some((r) =>
      r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('tecnico')
    )
  );

  const [activoId, setActivoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('preventivo');
  const [intervaloDias, setIntervaloDias] = useState('');
  const [proximaEjecucion, setProximaEjecucion] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const dias = Number(intervaloDias);
      if (!activoId || !nombre || !tipo || !dias || !proximaEjecucion) {
        setError('Completa todos los campos obligatorios.');
        return;
      }
      if (dias <= 0) {
        setError('El intervalo debe ser mayor a 0.');
        return;
      }
      setSaving(true);
      setError(null);
      try {
        await crearPlan({
          activo_id: activoId,
          nombre,
          tipo: tipo as 'preventivo' | 'correctivo' | 'predictivo',
          intervalo_dias: dias,
          proxima_ejecucion: proximaEjecucion,
          tecnico_responsable_id: tecnicoId || undefined,
          descripcion_tareas: descripcion || undefined,
        });
        router.push('/mantenimiento/planes');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear el plan.');
      } finally {
        setSaving(false);
      }
    },
    [activoId, nombre, tipo, intervaloDias, proximaEjecucion, tecnicoId, descripcion, crearPlan, router]
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
        Nuevo plan de mantenimiento
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Activo*</label>
            <Select
              value={activoId}
              onChange={(value) => setActivoId(value)}
              options={[{ value: '', label: 'Selecciona un activo...' }, ...activos.map((a) => ({ value: a.id, label: a.nombre }))]}
              className="w-full"
            />
          </div>

          <div>
            <label className={labelClass}>Nombre del plan*</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Mantenimiento trimestral HVAC"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tipo*</label>
            <Select value={tipo} onChange={(value) => setTipo(value)} options={TIPOS} className="w-full" />
          </div>

          <div>
            <label className={labelClass}>Intervalo (días)*</label>
            <input
              type="number"
              min="1"
              value={intervaloDias}
              onChange={(e) => setIntervaloDias(e.target.value)}
              placeholder="90"
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
            <Select
              value={tecnicoId}
              onChange={(value) => setTecnicoId(value)}
              options={[{ value: '', label: 'Sin técnico asignado' }, ...tecnicos.map((u) => ({ value: u.id, label: `${u.nombre} (${u.email})` }))]}
              className="w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Descripción de tareas</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Instrucciones o tareas a realizar..."
              className={`${inputClass} resize-none`}
            />
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
              {saving ? 'Creando...' : 'Crear plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

