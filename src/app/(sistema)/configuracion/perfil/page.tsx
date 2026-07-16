'use client';

import React, { useEffect, useState } from 'react';
import { Save, KeyRound, ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { getCurrentUser, cambiarContrasena } from '@/services/auth';
import { updateUsuario } from '@/services/usuarios';
import { getPreferences, updatePreferences } from '@/services/preferences';

export default function PerfilPage() {
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [prefs, setPrefs] = useState({ tema: 'oscuro', version: 1 });
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [user, p] = await Promise.all([getCurrentUser(), getPreferences().catch(() => null)]);
        if (cancelled) return;
        setUserId(user.id);
        setForm({ nombre: user.nombre, email: user.email, telefono: user.telefono ?? '' });
        if (p) { setPrefs({ tema: p.tema, version: p.version }); setPrefsLoaded(true); }
      } catch (err) {
        if (!cancelled) setStatus(err instanceof Error ? err.message : 'Error al cargar perfil');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setStatus('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setStatus('');
  };

  const handleThemeChange = async (tema: string) => {
    if (prefSaving || !prefsLoaded) return;
    setPrefSaving(true);
    try {
      const p = await updatePreferences(tema, prefs.version);
      setPrefs({ tema: p.tema, version: p.version });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al guardar preferencias');
    } finally {
      setPrefSaving(false);
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es obligatorio.';
    if (!form.email.trim()) next.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Email invalido.';
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
      await updateUsuario(userId, {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono || undefined,
      });

      if (passwordForm.actual && passwordForm.nueva) {
        if (passwordForm.nueva !== passwordForm.confirmar) {
          setErrors(prev => ({ ...prev, confirmar: 'Las contraseñas no coinciden.' }));
          setSubmitting(false);
          return;
        }
        await cambiarContrasena(passwordForm.actual, passwordForm.nueva);
        setPasswordForm({ actual: '', nueva: '', confirmar: '' });
      }

      setStatus('Perfil actualizado.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Configuración / Mi Perfil" variant="activos" />
      <p className="text-sm text-gray-500 mt-4">Cargando perfil...</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Configuración / Mi Perfil" variant="activos" />

      <div className="mb-6">
        <Link href="/configuracion" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a configuración
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
            <p className="text-gray-500 text-xs mt-1">Actualiza tus datos personales y contraseña.</p>
          </div>
          <button type="submit" form="perfil-form" disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
            <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        <form id="perfil-form" onSubmit={handleSubmit} className="max-w-xl space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Información personal</h3>

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
          </div>

          <div className="border-t border-gray-200 pt-8 space-y-6">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-gray-800">Preferencias visuales</h3>
            </div>
            <div className="flex gap-3">
              {[
                { value: 'claro', icon: Sun, label: 'Claro' },
                { value: 'oscuro', icon: Moon, label: 'Oscuro' },
                { value: 'sistema', icon: Monitor, label: 'Sistema' },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} type="button" onClick={() => handleThemeChange(t.value)}
                    className={`flex-1 flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all ${prefs.tema === t.value ? 'border-[#ECA03C] bg-amber-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                  >
                    <Icon className={`w-6 h-6 ${prefs.tema === t.value ? 'text-[#8B4513]' : 'text-gray-500'}`} strokeWidth={1.5} />
                    <span className={`text-xs font-semibold ${prefs.tema === t.value ? 'text-[#8B4513]' : 'text-gray-600'}`}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 space-y-6">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-gray-800">Cambiar contraseña</h3>
            </div>
            <p className="text-xs text-gray-400 -mt-4">Deja estos campos vacíos si no deseas cambiar la contraseña.</p>

            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="actual">Contraseña actual</label>
              <input id="actual" name="actual" type="password" value={passwordForm.actual} onChange={handlePasswordChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="nueva">Nueva contraseña</label>
              <input id="nueva" name="nueva" type="password" value={passwordForm.nueva} onChange={handlePasswordChange}
                className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="confirmar">Confirmar nueva contraseña</label>
              <input id="confirmar" name="confirmar" type="password" value={passwordForm.confirmar} onChange={handlePasswordChange}
                className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.confirmar ? 'border-red-500' : 'border-gray-400'}`} />
              {errors.confirmar && <p className="text-xs text-red-600 mt-1">{errors.confirmar}</p>}
            </div>
          </div>

          {status && <p className={`text-sm ${Object.keys(errors).length ? 'text-red-600' : 'text-emerald-700'}`}>{status}</p>}
        </form>
      </div>
    </div>
  );
}
