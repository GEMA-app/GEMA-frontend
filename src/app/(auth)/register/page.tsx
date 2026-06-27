'use client';

import React, { useState } from 'react';
import { User, Mail, KeyRound, ArrowRight, ShieldCheck, Zap, Building2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { persistAuthToken } from '../../../lib/gemaApi';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/autenticacion/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        window.location.href = '/login';
      } else {
        setError(result.mensaje || 'Error al registrarse');
      }
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    paddingLeft: '42px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    borderRadius: '12px',
    border: 'none',
    outline: 'none',
    backgroundColor: '#F5F0E8',
    fontSize: '14px',
    color: '#374151',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '6px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECEAE6',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '920px',
          borderRadius: '20px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        {/* ═══════════ Panel izquierdo azul marino ═══════════ */}
        <div
          style={{
            width: '300px',
            minWidth: '300px',
            backgroundColor: '#1E3A5F',
            borderRadius: '20px 0 0 20px',
            display: 'flex',
            flexDirection: 'column',
            padding: '36px',
          }}
        >
          {/* Logo GEMA */}
          <div style={{ marginBottom: '32px' }}>
            <Image
              src="/gema-logo.png"
              alt="GEMA Logo"
              width={110}
              height={110}
              style={{
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                opacity: 0.92,
              }}
            />
          </div>

          {/* Título */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '26px',
                lineHeight: 1.28,
                marginBottom: '40px',
              }}
            >
              Gestión
              <br />
              Estratégica de
              <br />
              Mantenimiento
              <br />
              de Activos
            </h1>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.10)',
                borderRadius: '16px',
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ShieldCheck color="rgba(255,255,255,0.80)" size={26} strokeWidth={1.6} />
              <span style={{ color: 'rgba(255,255,255,0.80)', fontSize: '11px', fontWeight: 500, textAlign: 'center' }}>
                Seguridad
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '16px',
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#A78BFA',
                }}
              />
              <Zap color="#ffffff" size={26} strokeWidth={1.6} fill="rgba(255,255,255,0.15)" />
              <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 500, textAlign: 'center' }}>
                Eficiencia
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.10)',
                borderRadius: '16px',
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Building2 color="rgba(255,255,255,0.80)" size={26} strokeWidth={1.6} />
              <span style={{ color: 'rgba(255,255,255,0.80)', fontSize: '11px', fontWeight: 500, textAlign: 'center' }}>
                Control
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════ Panel derecho blanco ═══════════ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 40px',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '28px', color: '#111827', marginBottom: '6px' }}>
              Regístrate
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Ingresa tus datos para que vivas la experiencia en GEMA
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                color: '#B91C1C',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nombre y Apellido */}
            <div>
              <label style={labelStyle}>Nombre y Apellido*</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18} color="#9CA3AF"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="register-fullname" type="text" name="fullName"
                  value={formData.fullName} onChange={handleInputChange}
                  placeholder="Pedro Perez" required style={inputStyle}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(30,58,95,0.2)'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Correo electrónico */}
            <div>
              <label style={labelStyle}>Correo electrónico*</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18} color="#9CA3AF"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="register-email" type="email" name="email"
                  value={formData.email} onChange={handleInputChange}
                  placeholder="pedroperez@gmail.com" required style={inputStyle}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(30,58,95,0.2)'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label style={labelStyle}>Crea una contraseña*</label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={18} color="#9CA3AF"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="register-password" type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleInputChange}
                  placeholder="Pedro123" required style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(30,58,95,0.2)'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#9CA3AF', display: 'flex', alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Verificar contraseña */}
            <div>
              <label style={labelStyle}>Verifique la contraseña*</label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={18} color="#9CA3AF"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="register-confirm-password" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleInputChange}
                  placeholder="Pedro123" required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(30,58,95,0.2)'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#9CA3AF', display: 'flex', alignItems: 'center'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Fila inferior */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
              }}
            >
              <Link
                href="/login"
                style={{ fontSize: '13px', fontWeight: 600, color: '#D4820A', textDecoration: 'none' }}
              >
                Tienes una cuenta?
              </Link>

              <button
                id="register-submit" type="submit" disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#E09825',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                Accede al sistema
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
