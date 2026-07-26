'use client';

import React, { useState } from 'react';
import { Mail, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Paso 1: Obtener token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/ingresar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
          },
          body: JSON.stringify({
            data: {
              type: 'tokens',
              attributes: { email, password },
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const detail = result?.errors?.[0]?.detail ?? result?.mensaje ?? 'Credenciales inválidas';
        setError(detail);
        return;
      }

      const token = result.data?.attributes?.access_token;
      if (token) localStorage.setItem('token', token);

      // Paso 2: Obtener perfil, empresa_id y roles
      const perfilResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/yo`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.api+json',
          },
        }
      );
      const perfil = await perfilResponse.json();
      const attrs = perfil.data?.attributes;

      if (attrs?.empresa_id) localStorage.setItem('empresaId', attrs.empresa_id);
      if (attrs?.roles && attrs.roles.length > 0) {
        localStorage.setItem('roles', JSON.stringify(attrs.roles));
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-[42px] pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';
  const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-12 bg-gema-bg-light dark:bg-gema-bg-dark">
      <div className="mb-8 flex justify-center">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/GEMA Logo Perlado.png"
            alt="GEMA"
            className="h-8 sm:h-10 w-auto"
          />
        </Link>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gema-surface-dark rounded-none sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-white/10">
        <div className="mb-7">
          <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white mb-1.5">
            Bienvenido
          </h2>
          <p className="text-gray-500 dark:text-white/60 text-sm">
            Ingresa tus credenciales para acceder a tu cuenta en GEMA
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Correo electrónico*</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pedroperez@gmail.com"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Contraseña*</label>
            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Pedro123"
                required
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <Link
                href="/olvide-contrasena"
                className="text-[13px] font-semibold text-gema-accent-dark dark:text-gema-accent no-underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <Link
                href="/register"
                className="text-[13px] font-semibold text-gema-accent-dark dark:text-gema-accent no-underline"
              >
                ¿No tienes cuenta?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer border-none"
            >
              Accede al sistema
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
