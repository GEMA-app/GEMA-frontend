'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
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

export default function EditarPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { editarPlan } = usePlanesMantenimiento();
  const { activos } = useActivos();
  const { usuarios } = useUsuarios();
  const tecnicos = usuarios.filter(u => u.roles.some(r => r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('tecnico')));

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
      .then(p => {
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
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Error al cargar plan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [id, nombre, tipo, intervaloDias, proximaEjecucion, tecnicoId, descripcion, activo, editarPlan, router]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Editar plan de mantenimiento" />

      <div className="mb-6">
        <Link href="/mantenimiento/planes" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <RequestState loading={loading} error={loadError} empty={!loading && !loadError && !plan}
        loadingMessage="Cargando plan..." emptyMessage="Plan no encontrado."
      >
        {plan && (
          <form onSubmit={handleSubmit} className="max-w-2xl rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6"
            style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Activo</label>
                <select value={activoId} onChange={e => setActivoId(e.target.value)}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
                  {activos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
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
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="accent-[#E59D12]" />
              Plan activo
            </label>
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                <Save className="w-4 h-4" strokeWidth={2.5} />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </RequestState>
    </div>
  );
}
