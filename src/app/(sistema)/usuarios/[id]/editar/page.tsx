'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { getUsuarioById, updateUsuario } from '@/services/usuarios';

export default function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const u = await getUsuarioById(id);
        if (cancelled) return;
        setForm({ nombre: u.nombre, email: u.email, telefono: u.telefono ?? '' });
        setActivo(u.activo);
      } catch (err) {
        if (!cancelled) setStatus(err instanceof Error ? err.message : 'Error al cargar usuario');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setStatus('');
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es obligatorio.';
    if (!form.email.trim()) next.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Email inválido.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) { setStatus('Corrige los errores.'); return; }
    setSubmitting(true);
    setStatus('Guardando...');
    try {
      await updateUsuario(id!, { nombre: form.nombre, email: form.email, telefono: form.telefono || undefined, activo });
      setStatus('Usuario actualizado.');
      setTimeout(() => router.push(`/usuarios/${id}`), 800);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Usuarios / Editar usuario" variant="activos" />
      <p className="text-sm text-gray-500 mt-4">Cargando usuario...</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Usuarios / Editar usuario" variant="activos" />

      <div className="mb-6">
        <Link href={`/usuarios/${id}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Usuario</h2>
            <p className="text-gray-500 text-xs mt-1">Modifique los datos del usuario.</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/usuarios/${id}`} className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">Cancelar</Link>
            <button type="submit" form="editar-usuario-form" disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        <form id="editar-usuario-form" onSubmit={handleSubmit} className="max-w-xl space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange}
              className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-400'}`} />
            {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.email ? 'border-red-500' : 'border-gray-400'}`} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="text" value={form.telefono} onChange={handleChange}
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
          </div>
          <div className="flex items-center gap-3">
            <input id="activo" type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)}
              className="w-4 h-4 rounded accent-[#E59D12]" />
            <label htmlFor="activo" className="text-sm text-gray-700">Usuario activo</label>
          </div>
          {status && <p className={`text-sm ${Object.keys(errors).length ? 'text-red-600' : 'text-emerald-700'}`}>{status}</p>}
        </form>
      </div>
    </div>
  );
}
