'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getArticulo, updateArticulo } from '@/services/catalogo';

export default function EditarArticuloPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', manufacturer: '', model: '', description: '', unit_of_measure: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getArticulo(id).then(a => setForm({
      name: a.name,
      manufacturer: a.manufacturer ?? '',
      model: a.model ?? '',
      description: a.description ?? '',
      unit_of_measure: a.unit_of_measure ?? '',
    })).catch(e => setError(e instanceof Error ? e.message : 'Error')).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError(null);
    try {
      await updateArticulo(id!, {
        name: form.name.trim(),
        manufacturer: form.manufacturer.trim() || null,
        model: form.model.trim() || null,
        description: form.description.trim() || null,
        unit_of_measure: form.unit_of_measure.trim() || null,
      });
      router.push(`/catalogo/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Cargando..." /> <p className="text-sm text-gray-500 mt-4">Cargando...</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Catálogo / Editar artículo" variant="activos" />

      <div className="mb-6">
        <Link href={`/catalogo/${id}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" /> Volver al detalle
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
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
