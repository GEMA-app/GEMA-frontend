'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { setSession } from '@/lib/auth';
import { login } from '@/services/auth';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
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
      const result = await login(email, password);
      setSession(result);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full pl-[42px] pr-4 py-3 rounded-xl bg-[#F5F0E8] text-sm text-gray-700 outline-none box-border focus:ring-2 focus:ring-[#1E3A5F]/20';
  const labelClass = 'block text-[13px] font-semibold text-gray-800 mb-1.5';

  return (
    <div className="flex w-full max-w-[920px] rounded-[20px] shadow-[0_12px_48px_rgba(0,0,0,0.14)] overflow-hidden bg-white">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex w-[300px] min-w-[300px] bg-[#1E3A5F] rounded-l-[20px] flex-col p-9">
        <div className="mb-8">
          <Image
            src="/gema-logo.png"
            alt="GEMA Logo"
            width={110}
            height={110}
            className="object-contain brightness-0 invert opacity-90"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-white font-extrabold text-[26px] leading-[1.28] mb-10">
            Gestión<br />Estratégica de<br />Mantenimiento<br />de Activos
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/10 rounded-2xl py-4 px-2 flex flex-col items-center gap-2.5">
            <ShieldCheck color="rgba(255,255,255,0.80)" size={26} strokeWidth={1.6} />
            <span className="text-white/80 text-[11px] font-medium text-center">Seguridad</span>
          </div>
          <div className="bg-white/[0.18] border border-white/[0.22] rounded-2xl py-4 px-2 flex flex-col items-center gap-2.5 relative">
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400" />
            <Zap color="#ffffff" size={26} strokeWidth={1.6} fill="rgba(255,255,255,0.15)" />
            <span className="text-white text-[11px] font-medium text-center">Eficiencia</span>
          </div>
          <div className="bg-white/10 rounded-2xl py-4 px-2 flex flex-col items-center gap-2.5">
            <Building2 color="rgba(255,255,255,0.80)" size={26} strokeWidth={1.6} />
            <span className="text-white/80 text-[11px] font-medium text-center">Control</span>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col justify-center px-10 py-12">
        <div className="mb-7">
          <h2 className="font-extrabold text-[28px] text-gray-900 mb-1.5">Bienvenido</h2>
          <p className="text-gray-500 text-sm">Ingresa tus credenciales para acceder a tu cuenta en GEMA</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Correo electrónico*</label>
            <div className="relative">
              <Mail size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              <KeyRound size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Link href="/olvide-contrasena" className="text-[13px] font-semibold text-[#D4820A] no-underline">
                ¿Olvidaste tu contraseña?
              </Link>
              <Link href="/register" className="text-[13px] font-semibold text-[#D4820A] no-underline">
                ¿No tienes cuenta?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#ECA03C] text-white font-semibold text-sm disabled:opacity-60 transition-opacity cursor-pointer border-none"
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
