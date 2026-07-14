'use client';

import { useState } from 'react';
import { solicitarReset } from '@/services/auth';

export default function OlvideContrasenaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await solicitarReset(email);
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Correo enviado</h1>
          <p className="text-gray-600 text-sm">
            Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
        <p className="text-gray-600 text-sm">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECA03C]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
    </div>
  );
}
