'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ArrowLeft, KeyRound, Check, X } from 'lucide-react';
import { cambiarContrasena } from '@/services/auth';
import { ApiError } from '@/lib/api';

const REGLAS = [
  { key: 'length', label: 'Al menos 8 caracteres', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: 'Al menos una mayúscula', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'number', label: 'Al menos un número', test: (v: string) => /[0-9]/.test(v) },
  { key: 'special', label: 'Al menos un carácter especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';

export default function ContrasenaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const reglasEstado = useMemo(
    () => REGLAS.map((regla) => ({ ...regla, ok: regla.test(form.nueva) })),
    [form.nueva],
  );
  const nuevaValida = reglasEstado.every((r) => r.ok);
  const confirmarValida = form.confirmar.length > 0 && form.confirmar === form.nueva;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError(null);
  };

  const inputClass = (invalid: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 transition-colors ${
      invalid
        ? 'border-red-400 focus:ring-red-400/40'
        : 'border-gray-200 dark:border-white/10 focus:ring-gema-accent/40'
    }`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);

    if (!form.actual || !nuevaValida || !confirmarValida) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await cambiarContrasena(form.actual, form.nueva);
      await Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Tu contraseña se cambió correctamente.',
        confirmButtonColor: '#ECA03C',
      });
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña.';
      setApiError(msg);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: '#ECA03C',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/configuracion"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a configuración
        </Link>
      </div>

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Cambiar contraseña
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent">
            <KeyRound className="h-5 w-5" strokeWidth={2} />
          </div>
          <p className="text-sm text-gray-500 dark:text-white/50">
            Usa una contraseña segura que no compartas con nadie.
          </p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
          <div>
            <label className={labelClass}>Contraseña actual*</label>
            <input
              name="actual"
              type="password"
              value={form.actual}
              onChange={handleChange}
              required
              className={inputClass(touched && !form.actual)}
            />
          </div>

          <div>
            <label className={labelClass}>Nueva contraseña*</label>
            <input
              name="nueva"
              type="password"
              value={form.nueva}
              onChange={handleChange}
              required
              className={inputClass(touched && !nuevaValida)}
            />
            <ul className="mt-2 space-y-1">
              {reglasEstado.map((regla) => (
                <li
                  key={regla.key}
                  className={`flex items-center gap-2 text-xs ${
                    regla.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-white/40'
                  }`}
                >
                  {regla.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {regla.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className={labelClass}>Confirmar nueva contraseña*</label>
            <input
              name="confirmar"
              type="password"
              value={form.confirmar}
              onChange={handleChange}
              required
              className={inputClass(touched && !confirmarValida)}
            />
            {touched && !confirmarValida && (
              <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" strokeWidth={2.5} />
              {submitting ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
