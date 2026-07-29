'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, KeyRound, ArrowRight, Building2, Eye, EyeOff } from 'lucide-react';
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
            Regístrate
          </h2>
          <p className="text-gray-500 dark:text-white/60 text-sm">
            Ingresa tus datos para vivir la experiencia en GEMA
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Nombre y Apellido*</label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Pedro Perez"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nombre de la empresa*</label>
            <div className="relative">
              <Building2
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              />
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Mi Empresa S.A."
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Correo electrónico*</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="pedroperez@gmail.com"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Crea una contraseña*</label>
            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
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

          <div>
            <label className={labelClass}>Verifique la contraseña*</label>
            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Pedro123"
                required
                className={`${inputClass} pr-11 ${passwordMismatch ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-red-500 dark:text-red-400 text-[13px] mt-1.5">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <Link
              href="/login"
              className="text-[13px] font-semibold text-gema-accent-dark dark:text-gema-accent no-underline"
            >
              ¿Tienes una cuenta?
            </Link>

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
