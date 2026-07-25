'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { createArticulo } from '@/services/catalogo';

const INITIAL = { name: '', manufacturer: '', model: '', description: '', unit_of_measure: '' };

export default function NuevoArticuloPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError(null);
    try {
      await createArticulo({
        name: form.name.trim(),
        manufacturer: form.manufacturer.trim() || undefined,
        model: form.model.trim() || undefined,
        description: form.description.trim() || undefined,
        unit_of_measure: form.unit_of_measure.trim() || undefined,
      });
      router.push('/catalogo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear artículo.');
    } finally { setSaving(false); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Catálogo / Nuevo artículo" variant="activos" />

      <div className="mb-6">
        <Link href="/catalogo" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="name">Nombre *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="manufacturer">Fabricante</label>
              <input id="manufacturer" name="manufacturer" value={form.manufacturer} onChange={handleChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="model">Modelo</label>
              <input id="model" name="model" value={form.model} onChange={handleChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="unit_of_measure">Unidad de medida</label>
              <input id="unit_of_measure" name="unit_of_measure" value={form.unit_of_measure} onChange={handleChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="description">Descripción</label>
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange}
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] text-sm border-gray-400 resize-none" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm hover:brightness-95 disabled:opacity-60 transition-all">
              <Save className="w-4 h-4" strokeWidth={2.5} />
              {saving ? 'Guardando...' : 'Guardar artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
