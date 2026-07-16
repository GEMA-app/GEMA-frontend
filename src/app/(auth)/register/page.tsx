'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, KeyRound, ArrowRight, ShieldCheck, Zap, Building2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { register } from '@/services/auth';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    if (name === 'confirmPassword') setPasswordMismatch(value !== formData.password);
    if (name === 'password') setPasswordMismatch(formData.confirmPassword !== '' && formData.confirmPassword !== value);
  };

  const validarPassword = (pass: string): string | null => {
    if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(pass)) return 'La contraseña debe contener al menos una letra mayúscula';
    if (!/[0-9]/.test(pass)) return 'La contraseña debe contener al menos un número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'La contraseña debe contener al menos un carácter especial';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    const passwordError = validarPassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        nombre: formData.fullName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
      });
      router.push('/login');
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
          <h2 className="font-extrabold text-[28px] text-gray-900 mb-1.5">Regístrate</h2>
          <p className="text-gray-500 text-sm">Ingresa tus datos para vivir la experiencia en GEMA</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Nombre y Apellido*</label>
            <div className="relative">
              <User size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                placeholder="Pedro Perez" required className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nombre de la empresa*</label>
            <div className="relative">
              <Building2 size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text" name="companyName" value={formData.companyName} onChange={handleInputChange}
                placeholder="Mi Empresa S.A." required className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Correo electrónico*</label>
            <div className="relative">
              <Mail size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email" name="email" value={formData.email} onChange={handleInputChange}
                placeholder="pedroperez@gmail.com" required className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Crea una contraseña*</label>
            <div className="relative">
              <KeyRound size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'} name="password"
                value={formData.password} onChange={handleInputChange}
                placeholder="Pedro123" required className={`${inputClass} pr-11`}
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Verifique la contraseña*</label>
            <div className="relative">
              <KeyRound size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                value={formData.confirmPassword} onChange={handleInputChange}
                placeholder="Pedro123" required
                className={`${inputClass} pr-11 ${passwordMismatch ? 'border border-red-500 focus:ring-red-500/20' : ''}`}
              />
              <button
                type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-red-500 text-[13px] mt-1.5">Las contraseñas no coinciden</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/login" className="text-[13px] font-semibold text-[#D4820A] no-underline">
              ¿Tienes una cuenta?
            </Link>

            <button
              type="submit" disabled={loading}
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
