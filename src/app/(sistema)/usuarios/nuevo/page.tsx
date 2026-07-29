'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { createUsuario } from '@/services/usuarios';
import { getRoles, asignarRol } from '@/services/roles';
import { Select } from '@/components/ui/Select';
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
    let cancelled = false;
    getRoles()
      .then((data) => {
        if (!cancelled) setRoles(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatus('');
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es obligatorio.';
    if (!form.email.trim()) next.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Email inválido.';
    if (!form.password) next.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 6) next.password = 'Mínimo 6 caracteres.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setStatus('Guardando...');
    try {
      const usuario = await createUsuario({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        telefono: form.telefono.trim() || undefined,
      });

      if (selectedRol) {
        await asignarRol(selectedRol, usuario.id).catch(() => {});
      }

      setStatus('Usuario creado correctamente.');
      await Swal.fire({
        icon: 'success',
        title: '¡Creado exitosamente!',
        text: 'El registro fue creado correctamente.',
        confirmButtonColor: '#ECA03C',
        timer: 2000,
        timerProgressBar: true,
      });
      setTimeout(() => router.push('/usuarios'), 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el usuario';
      setStatus(message);
      setSubmitting(false);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#ECA03C',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <Link
            href="/usuarios"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50 hover:text-gema-primary dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a usuarios
          </Link>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Nuevo usuario
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Registrar un nuevo usuario en el sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/usuarios"
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark text-gema-primary dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            form="nuevo-usuario-form"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" strokeWidth={2.5} />
            {submitting ? 'Guardando...' : 'Guardar usuario'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
        {status && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${
              Object.keys(errors).length > 0 || status.includes('Error')
                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
            }`}
          >
            {Object.keys(errors).length > 0 || status.includes('Error') ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : null}
            {status}
          </div>
        )}

        <form id="nuevo-usuario-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="nombre"
                className="block text-xs font-semibold uppercase tracking-wider text-gema-primary/70 dark:text-white/60 mb-2"
              >
                Nombre completo *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. María Pérez"
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent ${
                  errors.nombre
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.nombre && (
                <p className="mt-1.5 text-xs text-red-500">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-gema-primary/70 dark:text-white/60 mb-2"
              >
                Correo electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej. usuario@empresa.com"
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent ${
                  errors.email
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-gema-primary/70 dark:text-white/60 mb-2"
              >
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent ${
                  errors.password
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-white/10'
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="telefono"
                className="block text-xs font-semibold uppercase tracking-wider text-gema-primary/70 dark:text-white/60 mb-2"
              >
                Teléfono (opcional)
              </label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej. +58 412 1234567"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="rol"
                className="block text-xs font-semibold uppercase tracking-wider text-gema-primary/70 dark:text-white/60 mb-2"
              >
                Rol del sistema
              </label>
              <Select
                id="rol"
                value={selectedRol}
                onChange={(value) => setSelectedRol(value)}
                options={[
                  { value: '', label: 'Seleccione un rol...' },
                  ...roles.map((r) => ({ value: r.id, label: r.nombre })),
                ]}
                className="w-full"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
