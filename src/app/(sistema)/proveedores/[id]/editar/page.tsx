'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Truck, AlertCircle } from 'lucide-react';
import { getProveedor, updateProveedor } from '@/services/proveedores';

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
    version: 1,
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
        setLoading(true);
        const s = await getProveedor(proveedorId);
        if (!cancelled) {
          setFormData({
            name: s.name || '',
            rif: s.rif || '',
            phone: s.phone || '',
            email: s.email || '',
            contact: s.contact || '',
            version: s.version || 1,
          });
        }
      } catch (err) {
        if (!cancelled) setSubmitStatus(err instanceof Error ? err.message : 'Error al cargar proveedor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [proveedorId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'El nombre del proveedor es obligatorio.';
    if (!formData.rif.trim()) next.rif = 'El RIF / NIT es obligatorio.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitStatus('Por favor corrige los errores resaltados antes de guardar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Guardando cambios...');

    try {
      await updateProveedor(proveedorId, {
        name: formData.name.trim(),
        rif: formData.rif.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        contact: formData.contact.trim() || undefined,
        version: formData.version,
      });
      setSubmitStatus('Proveedor actualizado correctamente.');
      setTimeout(() => router.push(`/proveedores/${proveedorId}`), 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el proveedor';
      setSubmitStatus(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-gema-primary/60 dark:text-white/50">Cargando datos del proveedor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/proveedores/${proveedorId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gema-primary/70 dark:text-white/70 hover:text-gema-primary dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Ficha
        </Link>
      </div>

      <div className="flex flex-col gap-1 mb-8">
        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
          Editar Proveedor
        </h1>
        <p className="text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
          Modifique los datos principales del proveedor
        </p>
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-white/10 text-gema-primary dark:text-white font-semibold">
            <Truck className="w-5 h-5 text-gema-accent" />
            <span>Información del Proveedor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gema-primary/70 dark:text-white/70 mb-1.5">
                Nombre del Proveedor *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border ${
                  errors.name ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                } text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="rif" className="block text-xs font-semibold text-gema-primary/70 dark:text-white/70 mb-1.5">
                RIF / NIT *
              </label>
              <input
                id="rif"
                name="rif"
                type="text"
                value={formData.rif}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border ${
                  errors.rif ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
                } text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent`}
              />
              {errors.rif && <p className="text-xs text-red-500 mt-1">{errors.rif}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gema-primary/70 dark:text-white/70 mb-1.5">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gema-primary/70 dark:text-white/70 mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-xs font-semibold text-gema-primary/70 dark:text-white/70 mb-1.5">
                Persona de Contacto
              </label>
              <input
                id="contact"
                name="contact"
                type="text"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
              />
            </div>
          </div>

          {submitStatus && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                submitStatus.includes('correctamente')
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitStatus}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
            <Link
              href={`/proveedores/${proveedorId}`}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/10 text-gema-primary dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" strokeWidth={2} />
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
