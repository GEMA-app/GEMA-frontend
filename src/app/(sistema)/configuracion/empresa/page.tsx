'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Save, Building2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useEmpresa } from '@/hooks/useEmpresa';

const RIF_REGEX = /^[JVEGjveg]\d{6,10}$/;

function EmpresaPageContent() {
  const { empresa, loading, error, saving, saveError, saveOk, guardarEmpresa, refetch } = useEmpresa();
  const [nombre, setNombre] = useState('');
  const [rif, setRif] = useState('');
  const [email, setEmail] = useState('');
  const [rifError, setRifError] = useState('');

  useEffect(() => {
    if (empresa) {
      setNombre(empresa.nombre);
      setRif(empresa.rif ?? '');
      setEmail(empresa.email_contacto ?? '');
    }
  }, [empresa]);

  const validateRif = useCallback((value: string): boolean => {
    if (!value) return true; // RIF es opcional
    if (!RIF_REGEX.test(value)) {
      setRifError('Formato inválido. Ej: J-123456789');
      return false;
    }
    setRifError('');
    return true;
  }, []);

  const handleSave = useCallback(async () => {
    if (!empresa || !nombre.trim()) return;
    if (!validateRif(rif)) return;
    try {
      await guardarEmpresa({
        nombre: nombre.trim(),
        rif: rif.trim() || undefined,
        email_contacto: email.trim() || undefined,
        version: empresa.version,
      });
    } catch {
      // Manejado por useEmpresa
    }
  }, [empresa, nombre, rif, email, guardarEmpresa, validateRif]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Configuración / Empresa" variant="configuracion" />

      <div className="mb-6">
        <Link href="/configuracion" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a configuración
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={!loading && !error && !empresa}
        loadingMessage="Cargando datos de la empresa..."
        emptyMessage="Empresa no encontrada."
      >
        {empresa && (
          <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8 max-w-3xl" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
            <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#E59D12]" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Perfil de la empresa</h2>
                  <p className="text-gray-500 text-xs mt-1">Slug: {empresa.slug} — Estado: {empresa.estado}</p>
                </div>
              </div>
              
              <PermissionGuard module="administracion" action="edit">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !nombre.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </PermissionGuard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Nombre de la empresa *</label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="rif">RIF (ej: J-123456789)</label>
                <input
                  id="rif"
                  type="text"
                  value={rif}
                  onChange={e => { setRif(e.target.value); setRifError(''); }}
                  onBlur={() => validateRif(rif)}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                />
                {rifError && <p className="text-xs text-red-600 mt-1">{rifError}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1" htmlFor="email">Email de contacto</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div><span className="text-xs text-gray-400">Plan:</span> {empresa.plan_id || 'Sin plan'}</div>
              <div><span className="text-xs text-gray-400">Trial hasta:</span> {empresa.trial_hasta || '—'}</div>
              <div><span className="text-xs text-gray-400">Versión:</span> {empresa.version}</div>
            </div>

            {saveOk && <p className="text-sm text-emerald-700">Datos guardados correctamente.</p>}
            {saveError === 'recargar' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center justify-between" role="alert">
                <span>Los datos de la empresa cambiaron en el servidor.</span>
                <button
                  type="button"
                  onClick={() => { void refetch(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                  Recargar datos
                </button>
              </div>
            )}
            {saveError && saveError !== 'recargar' && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {saveError}
              </div>
            )}
          </div>
        )}
      </RequestState>
    </div>
  );
}

export default function EmpresaPage() {
  return (
    <AuthGuard roleRequired="admin">
      <EmpresaPageContent />
    </AuthGuard>
  );
}
