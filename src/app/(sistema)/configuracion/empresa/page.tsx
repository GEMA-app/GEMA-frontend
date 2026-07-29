'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { getEmpresa, updateEmpresa } from '@/services/empresa';
import type { Empresa } from '@/types/empresa';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function EmpresaPage() {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [rif, setRif] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEmpresa()
      .then(e => {
        setEmpresa(e);
        setNombre(e.nombre);
        setRif(e.rif ?? '');
        setEmail(e.email_contacto ?? '');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar empresa'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    if (!empresa) return;
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      const updated = await updateEmpresa({
        nombre,
        rif: rif || undefined,
        email_contacto: email || undefined,
        version: empresa.version,
      });
      setEmpresa(updated);
      setNombre(updated.nombre);
      setRif(updated.rif ?? '');
      setEmail(updated.email_contacto ?? '');
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 4000);
      await Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'Los cambios fueron guardados correctamente.',
        confirmButtonColor: '#ECA03C',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      const finalMsg = (msg.includes('ERR_STALE_DATA') || msg.includes('409'))
        ? 'Los datos de la empresa fueron modificados por otro usuario. Por favor recarga la página para ver los cambios actualizados.'
        : msg;
      setSaveError(finalMsg);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: finalMsg,
        confirmButtonColor: '#ECA03C',
      });
    } finally {
      setSaving(false);
    }
  }, [empresa, nombre, rif, email]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Configuración / Empresa" variant="configuracion" />

      <div className="mb-6">
        <Link href="/configuracion" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a configuración
        </Link>
      </div>

      <RequestState loading={loading} error={error} empty={!loading && !error && !empresa}
        loadingMessage="Cargando datos de la empresa..." emptyMessage="Empresa no encontrada."
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
                <button type="button" onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer">
                  <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </PermissionGuard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Nombre de la empresa</label>
                <input id="nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="rif">RIF</label>
                <input id="rif" type="text" value={rif} onChange={e => setRif(e.target.value)}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1" htmlFor="email">Email de contacto</label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div><span className="text-xs text-gray-400">Plan:</span> {empresa.plan_id || 'Sin plan'}</div>
              <div><span className="text-xs text-gray-400">Trial hasta:</span> {empresa.trial_hasta || '—'}</div>
              <div><span className="text-xs text-gray-400">Versión:</span> {empresa.version}</div>
            </div>

            {saveOk && <p className="text-sm text-emerald-700">Datos guardados correctamente.</p>}
            {saveError && (
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
