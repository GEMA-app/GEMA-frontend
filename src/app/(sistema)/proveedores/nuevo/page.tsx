'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { createProveedor } from '@/services/proveedores';

const initialFormState = {
  name: '',
  rif: '',
  phone: '',
  email: '',
  contact: '',
};

export default function RegistrarProveedorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'El nombre del proveedor es obligatorio.';
    if (!formData.rif.trim()) next.rif = 'El RIF es obligatorio.';
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validateForm();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitStatus('Por favor corrige los errores antes de guardar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Guardando...');

    try {
      await createProveedor({
        name: formData.name,
        rif: formData.rif,
        phone: formData.phone,
        email: formData.email,
        contact: formData.contact,
      });
      setSubmitStatus('Proveedor guardado correctamente.');
      setTimeout(() => router.push('/proveedores'), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el proveedor';
      setSubmitStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader
        title="Proveedores / Registrar nuevo proveedor"
        variant="activos"
        searchPlaceholder="Buscar proveedor..."
        searchLabel="Buscar proveedores"
      />

      <div className="mb-6">
        <Link href="/proveedores" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <div
        className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8"
        style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}
      >
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Proveedor</h2>
            <p className="text-gray-500 text-xs mt-1">Complete los datos del proveedor.</p>
          </div>

          <div className="flex gap-3">
            <Link href="/proveedores" className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all flex items-center justify-center">
              Cancelar
            </Link>
            <button
              type="submit"
              form="registrar-proveedor-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'guardar proveedor'}
            </button>
          </div>
        </div>

        <form id="registrar-proveedor-form" onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
              <FileText className="w-5 h-5" />
              <span className="text-gray-800">Datos del Proveedor</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="name">Nombre del Proveedor</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.name ? 'border-red-500' : 'border-gray-400'}`}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="rif">RIF</label>
                <input
                  id="rif"
                  name="rif"
                  type="text"
                  value={formData.rif}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.rif ? 'border-red-500' : 'border-gray-400'}`}
                />
                {errors.rif && <p className="text-xs text-red-600 mt-1">{errors.rif}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="contact">Persona de Contacto</label>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                />
              </div>
            </div>
          </div>

          {submitStatus && (
            <p className={`text-sm ${Object.keys(errors).length > 0 && !submitStatus.includes('correctamente') ? 'text-red-600' : 'text-emerald-700'}`}>{submitStatus}</p>
          )}
        </form>
      </div>
    </div>
  );
}
