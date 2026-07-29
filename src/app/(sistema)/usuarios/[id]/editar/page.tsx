'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getUsuarioById, updateUsuario } from '@/services/usuarios';
import { getRoles, asignarRol, revocarRol } from '@/services/roles';
import { Select } from '@/components/ui/Select';
import type { Rol } from '@/types/rol';

export default function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [activo, setActivo] = useState(true);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [selectedRol, setSelectedRol] = useState('');
  const [originalRol, setOriginalRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const [u, r] = await Promise.all([getUsuarioById(id), getRoles()]);
        if (cancelled) return;
        setForm({ nombre: u.nombre, email: u.email, telefono: u.telefono ?? '' });
        setActivo(u.activo);
        setRoles(r);
        const current = r.find((rol) =>
          u.roles.some((ur) => ur === rol.id || ur === rol.nombre),
        );
        const currentId = current?.id || '';
        setSelectedRol(currentId);
        setOriginalRol(currentId);
      } catch (err) {
        if (!cancelled) setStatus(err instanceof Error ? err.message : 'Error al cargar usuario');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
      await updateUsuario(id!, {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        activo,
      });

      if (selectedRol && selectedRol !== originalRol) {
        if (originalRol) await revocarRol(originalRol, id!).catch(() => {});
        await asignarRol(selectedRol, id!).catch(() => {});
      }

      setStatus('Usuario actualizado correctamente.');
      await Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'Los cambios fueron guardados correctamente.',
        confirmButtonColor: '#ECA03C',
        timer: 2000,
        timerProgressBar: true,
      });
      setTimeout(() => router.push(`/usuarios/${id}`), 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar usuario';
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gema-primary/60 dark:text-white/50">
        Cargando usuario...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <Link
            href={`/usuarios/${id}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50 hover:text-gema-primary dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al detalle
          </Link>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Editar usuario
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Modificar información y rol del usuario
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/usuarios/${id}`}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark text-gema-primary dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            form="editar-usuario-form"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" strokeWidth={2.5} />
            {submitting ? 'Guardando...' : 'Guardar cambios'}
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

        <form id="editar-usuario-form" onSubmit={handleSubmit} className="space-y-6">
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
                htmlFor="telefono"
                className="block text-xs font-semibold uppercase tracking-wider text-gema-primary/70 dark:text-white/60 mb-2"
              >
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                value={form.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent"
              />
            </div>

            <div>
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

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                id="activo"
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 rounded accent-gema-accent cursor-pointer"
              />
              <label
                htmlFor="activo"
                className="text-sm font-medium text-gema-primary dark:text-white cursor-pointer"
              >
                Usuario activo
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
