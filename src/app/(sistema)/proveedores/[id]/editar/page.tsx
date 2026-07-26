'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { getProveedor, updateProveedor } from '@/services/proveedores';
import { ApiError } from '@/lib/api';

export default function EditarProveedorPage() {
  const params = useParams();
  const proveedorId = params.id as string;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    rif: '',
    phone: '',
    email: '',
    contact: '',
    version: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!proveedorId) return;
    let cancelled = false;
    (async () => {
      try {
        const s = await getProveedor(proveedorId);
        if (!cancelled) {
          setFormData({
            name: s.name,
            rif: s.rif || '',
            phone: s.phone || '',
            email: s.email || '',
            contact: s.contact || '',
            version: s.version,
          });
        }
      } catch (err) {
        if (!cancelled) setSubmitStatus(err instanceof Error ? err.message : 'Error al cargar proveedor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [proveedorId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'El nombre del proveedor es obligatorio.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validateForm();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitStatus('Por favor corrige los errores antes de guardar.');
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus('Guardando...');
    try {
      await updateProveedor(proveedorId, {
        name: formData.name,
        rif: formData.rif || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        contact: formData.contact || undefined,
        version: formData.version,
      });
      setSubmitStatus('Proveedor actualizado correctamente.');
      setTimeout(() => router.push(`/proveedores/${proveedorId}`), 800);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitStatus('Conflicto de versión: el proveedor fue modificado por otro usuario. Recarga los datos e intenta de nuevo.');
      } else {
        const msg = err instanceof Error ? err.message : 'Error al actualizar el proveedor';
        setSubmitStatus(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
        <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
          <PageHeader title="Proveedores / Editar proveedor" variant="proveedores" />
          <p className="text-gray-500 text-sm mt-8">Cargando datos del proveedor...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
        <PageHeader title="Proveedores / Editar proveedor" variant="proveedores" />

        <div className="mb-6">
          <Link href={`/proveedores/${proveedorId}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" />
            Volver a la ficha
          </Link>
        </div>

        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Editar Proveedor</h2>
              <p className="text-gray-500 text-xs mt-1">Modifique los datos del proveedor.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/proveedores" className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
                Cancelar
              </Link>
              <button
                type="submit"
                form="editar-proveedor-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          <form id="editar-proveedor-form" onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Datos del Proveedor</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="name">Nombre del Proveedor</label>
                  <input
                    id="name" name="name" type="text"
                    value={formData.name} onChange={handleInputChange}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.name ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="rif">RIF</label>
                  <input
                    id="rif" name="rif" type="text"
                    value={formData.rif} onChange={handleInputChange}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="phone">Teléfono</label>
                  <input
                    id="phone" name="phone" type="text"
                    value={formData.phone} onChange={handleInputChange}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="email">Email</label>
                  <input
                    id="email" name="email" type="email"
                    value={formData.email} onChange={handleInputChange}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="contact">Persona de Contacto</label>
                  <input
                    id="contact" name="contact" type="text"
                    value={formData.contact} onChange={handleInputChange}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                  />
                </div>
              </div>
            </div>

            {submitStatus && (
              <p className={`text-sm ${submitStatus.includes('correctamente') ? 'text-emerald-700' : 'text-red-600'}`}>{submitStatus}</p>
            )}
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
