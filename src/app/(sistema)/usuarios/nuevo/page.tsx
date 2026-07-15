'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { createUsuario } from '@/services/usuarios';
import { getRoles, asignarRol } from '@/services/roles';
import type { Rol } from '@/types/rol';

const initialForm = { nombre: '', email: '', password: '', telefono: '' };

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [selectedRol, setSelectedRol] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRoles().then(setRoles).catch(() => {});
  }, []);

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
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Email invalido.';
    if (!form.password) next.password = 'La contrasena es obligatoria.';
    else if (form.password.length < 6) next.password = 'Minimo 6 caracteres.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) { setStatus('Corrige los errores antes de guardar.'); return; }
    setSubmitting(true);
    setStatus('Guardando...');
    try {
      const usuario = await createUsuario(form);
      if (selectedRol) await asignarRol(selectedRol, usuario.id).catch(() => {});
      setStatus('Usuario creado correctamente.');
      setTimeout(() => router.push('/usuarios'), 800);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Usuarios / Nuevo usuario" variant="activos" />

      <div className="mb-6">
        <Link href="/usuarios" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Usuario</h2>
            <p className="text-gray-500 text-xs mt-1">Complete los datos para crear un nuevo usuario en el sistema.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/usuarios" className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">Cancelar</Link>
            <button type="submit" form="nuevo-usuario-form" disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {submitting ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </div>

        <form id="nuevo-usuario-form" onSubmit={handleSubmit} className="max-w-xl space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange}
              className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-400'}`} />
            {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="email">Correo electronico</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.email ? 'border-red-500' : 'border-gray-400'}`} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="password">Contrasena</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange}
              className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.password ? 'border-red-500' : 'border-gray-400'}`} />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="telefono">Telefono (opcional)</label>
            <input id="telefono" name="telefono" type="text" value={form.telefono} onChange={handleChange}
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="rol">Rol</label>
            <select id="rol" value={selectedRol} onChange={e => setSelectedRol(e.target.value)}
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400">
              <option value="">Seleccione un rol...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>

          {status && <p className={`text-sm ${Object.keys(errors).length ? 'text-red-600' : 'text-emerald-700'}`}>{status}</p>}
        </form>
      </div>
    </div>
  );
}
