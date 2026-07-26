'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';

const TIPOS = [
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
];

export default function NuevoPlanPage() {
  const router = useRouter();
  const { crearPlan } = usePlanesMantenimiento();
  const { activos } = useActivos();
  const { usuarios } = useUsuarios();
  const tecnicos = usuarios.filter(u => u.roles.some(r => r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('tecnico')));

  const [activoId, setActivoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('preventivo');
  const [intervaloDias, setIntervaloDias] = useState('');
  const [proximaEjecucion, setProximaEjecucion] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [activoId, nombre, tipo, intervaloDias, proximaEjecucion, tecnicoId, descripcion, crearPlan, router]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Nuevo plan de mantenimiento" />

      <div className="mb-6">
        <Link href="/mantenimiento/planes" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6"
        style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Activo *</label>
            <select value={activoId} onChange={e => setActivoId(e.target.value)} required
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
              <option value="">Seleccionar...</option>
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
            <Save className="w-4 h-4" strokeWidth={2.5} />
            {saving ? 'Creando...' : 'Crear plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
