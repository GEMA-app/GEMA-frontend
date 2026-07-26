'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { NuevoPlanInput, ActualizarPlanInput } from '@/types/plan-mantenimiento';

interface ActivoOption {
  id: string;
  nombre: string;
}

interface TecnicoOption {
  id: string;
  nombre: string;
  email: string;
}

interface PlanFormProps {
  activos: ActivoOption[];
  tecnicos: TecnicoOption[];
  initialValues?: {
    activo_id?: string;
    nombre?: string;
    tipo?: string;
    intervalo_dias?: string;
    proxima_ejecucion?: string;
    tecnico_responsable_id?: string;
    descripcion_tareas?: string;
    activo?: boolean;
  };
  onSubmit: (data: NuevoPlanInput | ActualizarPlanInput) => Promise<void>;
  submitLabel?: string;
  isEditing?: boolean;
}

const TIPOS = [
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
];

export default function PlanForm({ activos, tecnicos, initialValues, onSubmit, submitLabel = 'Guardar', isEditing = false }: PlanFormProps) {
  const [activoId, setActivoId] = useState(initialValues?.activo_id ?? '');
  const [nombre, setNombre] = useState(initialValues?.nombre ?? '');
  const [tipo, setTipo] = useState(initialValues?.tipo ?? 'preventivo');
  const [intervaloDias, setIntervaloDias] = useState(initialValues?.intervalo_dias ?? '');
  const [proximaEjecucion, setProximaEjecucion] = useState(initialValues?.proxima_ejecucion ?? '');
  const [tecnicoId, setTecnicoId] = useState(initialValues?.tecnico_responsable_id ?? '');
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion_tareas ?? '');
  const [activo, setActivo] = useState(initialValues?.activo ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dias = Number(intervaloDias);
    if (isEditing && !activoId) {
      // en edicion el activo_id no se cambia, se omite
    } else if (!isEditing && !activoId) {
      setError('Selecciona un activo.');
      return;
    }
    if (!nombre || !tipo || !dias || !proximaEjecucion) {
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
      const data: Record<string, unknown> = {
        ...(!isEditing && { activo_id: activoId }),
        nombre,
        tipo: tipo as 'preventivo' | 'correctivo' | 'predictivo',
        intervalo_dias: dias,
        proxima_ejecucion: proximaEjecucion,
        tecnico_responsable_id: tecnicoId || undefined,
        descripcion_tareas: descripcion || undefined,
        ...(isEditing && { activo }),
      };
      await onSubmit(data as unknown as NuevoPlanInput & ActualizarPlanInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6"
      style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Activo {!isEditing && '*'}</label>
          {isEditing ? (
            <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">
              {activos.find(a => a.id === activoId)?.nombre ?? activoId}
            </p>
          ) : (
            <select value={activoId} onChange={e => setActivoId(e.target.value)} required
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
              <option value="">Seleccionar...</option>
              {activos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
            className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo *</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Intervalo (días) *</label>
          <input type="number" min="1" value={intervaloDias} onChange={e => setIntervaloDias(e.target.value)} required
            className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Próxima ejecución *</label>
          <input type="date" value={proximaEjecucion} onChange={e => setProximaEjecucion(e.target.value)} required
            className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Técnico responsable</label>
          <select value={tecnicoId} onChange={e => setTecnicoId(e.target.value)}
            className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
            <option value="">Seleccionar...</option>
            {tecnicos.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Descripción de tareas</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
          className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400 resize-none" />
      </div>
      {isEditing && (
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="accent-[#E59D12]" />
          Plan activo
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          <Save className="w-4 h-4" strokeWidth={2.5} />
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
