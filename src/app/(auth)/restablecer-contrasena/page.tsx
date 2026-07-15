'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { restablecerContrasena } from '@/services/auth';
import { ApiError } from '@/lib/api';

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">Enlace inválido</h1>
        <p className="text-gray-600 text-sm mt-2">El enlace de restablecimiento no es válido o ha expirado.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await restablecerContrasena(token, nueva);
      router.push('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-[#F5F0E8] rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#ECA03C]';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Restablecer contraseña</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
        <input
          type="password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
      </button>
    </form>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Cargando...</p>}>
      <RestablecerForm />
    </Suspense>
  );
}
