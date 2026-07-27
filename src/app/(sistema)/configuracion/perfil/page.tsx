'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, Save, KeyRound, Loader2 } from 'lucide-react';
import { getCurrentUser } from '@/services/auth';
import { updateUsuario } from '@/services/usuarios';

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';
const disabledInputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-400 dark:text-white/40 outline-none box-border cursor-not-allowed';

export default function PerfilPage() {
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;
        setUserId(user.id);
        setForm({ nombre: user.nombre, email: user.email, telefono: user.telefono ?? '' });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateUsuario(userId, {
        nombre: form.nombre.trim(),
        telefono: form.telefono || undefined,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tus datos se guardaron correctamente.',
        confirmButtonColor: '#ECA03C',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/configuracion"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a configuración
        </Link>
        <Link
          href="/configuracion/contrasena"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          Cambiar contraseña
        </Link>
      </div>

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Mi perfil
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Nombre completo*</label>
                <input
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Correo electrónico</label>
                <input type="email" value={form.email} disabled className={disabledInputClass} />
              </div>

              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  name="telefono"
                  type="text"
                  value={form.telefono}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" strokeWidth={2.5} />
                  {submitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
