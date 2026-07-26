'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  MapPin,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import { useActivos } from '@/hooks/useActivos';

const initialFormState = {
  nombre: '',
  codigo: '',
  marca: '',
  ubicacion: '',
  fechaCompra: '',
  valorMonetario: '',
  moneda: 'USD',
  detalles: '',
  estadoInicial: 'Operativo',
};

function RegistrarActivoContent() {
  const { ubicaciones, loading: loadingUbicaciones, error: ubicacionesError } = useUbicaciones();
  const ubicacionOptions = useMemo(
    () => flattenUbicacionesForSelect(ubicaciones),
    [ubicaciones],
  );
  const router = useRouter();
  const { crearActivo } = useActivos();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      nextErrors.nombre = 'El serial interno (nombre) del activo es obligatorio.';
    }
    if (!formData.codigo.trim()) {
      nextErrors.codigo = 'El código de activo es obligatorio.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitStatus('Por favor corrige los errores antes de guardar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Guardando...');

    try {
      await crearActivo({
        nombre: formData.nombre,
        codigo: formData.codigo,
        marca: formData.marca,
        ubicacion: formData.ubicacion,
        fechaCompra: formData.fechaCompra,
        valorMonetario: formData.valorMonetario,
        moneda: formData.moneda,
        estadoInicial: formData.estadoInicial,
      });
      setSubmitStatus('Activo guardado correctamente.');
      setTimeout(() => router.push('/activos'), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el activo';
      setSubmitStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader
        title="Activos / Registrar nuevo activo"
        variant="activos"
        searchPlaceholder="Buscar activo..."
        searchLabel="Buscar activos"
      />

      <div className="mb-6">
        <Link href="/activos" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
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
            <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Activo</h2>
            <p className="text-gray-500 text-xs mt-1">Complete los detalles para ingresar un equipo al inventario.</p>
          </div>

          <div className="flex gap-3">
            <Link href="/activos" className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all flex items-center justify-center">
              Cancelar
            </Link>
            <PermissionGuard module="activos" action="create">
              <button
                type="submit"
                form="registrar-activo-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
                {isSubmitting ? 'Guardando...' : 'guardar activo'}
              </button>
            </PermissionGuard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form id="registrar-activo-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Información General</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Serial Interno (Nombre)</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="codigo">Código Único de Activo</label>
                  <input
                    id="codigo"
                    name="codigo"
                    type="text"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.codigo ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.codigo && <p className="text-xs text-red-600 mt-1">{errors.codigo}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="marca">Marca / Fabricante (Catálogo)</label>
                  <input
                    id="marca"
                    name="marca"
                    type="text"
                    value={formData.marca}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <MapPin className="w-5 h-5" />
                <span className="text-gray-800">Ubicación y Adquisición</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="ubicacion">Ubicación Física</label>
                  <select
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    disabled={loadingUbicaciones}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.ubicacion ? 'border-red-500' : 'border-gray-400'}`}
                  >
                    <option value="">
                      {loadingUbicaciones ? 'Cargando ubicaciones...' : 'Seleccione una ubicación'}
                    </option>
                    {ubicacionOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {ubicacionesError && (
                    <p className="text-xs text-amber-700 mt-1">{ubicacionesError}</p>
                  )}
                  {errors.ubicacion && <p className="text-xs text-red-600 mt-1">{errors.ubicacion}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="fechaCompra">Fecha de Adquisición</label>
                  <input
                    id="fechaCompra"
                    name="fechaCompra"
                    type="date"
                    value={formData.fechaCompra}
                    onChange={handleInputChange}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    className={`date-input w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.fechaCompra ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.fechaCompra && <p className="text-xs text-red-600 mt-1">{errors.fechaCompra}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="valorMonetario">Valor Monetario</label>
                  <input
                    id="valorMonetario"
                    name="valorMonetario"
                    type="text"
                    inputMode="decimal"
                    value={formData.valorMonetario}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.valorMonetario ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.valorMonetario && <p className="text-xs text-red-600 mt-1">{errors.valorMonetario}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="moneda">Moneda</label>
                  <select
                    id="moneda"
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="VES">VES</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Detalles Adicionales</span>
              </div>
              <div>
                <textarea
                  id="detalles"
                  name="detalles"
                  rows={4}
                  value={formData.detalles}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 bg-transparent p-4 outline-none focus:border-[#E59D12] transition-colors text-sm resize-none shadow-inner"
                />
              </div>
              {submitStatus && (
                <p className={`text-sm ${Object.keys(errors).length === 0 ? 'text-emerald-700' : 'text-red-600'}`}>{submitStatus}</p>
              )}
            </div>
          </form>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md flex flex-col items-center">
            <h3 className="text-gray-800 font-bold text-center mb-6 text-base">Estado Inicial</h3>
            <div className="w-full space-y-3">
              {['Operativo', 'En mantenimiento', 'Fuera de servicio', 'Dado de baja'].map((est) => (
                <label key={est} className="flex items-center px-4 py-3 border border-gray-200 rounded-xl cursor-pointer transition-all bg-white">
                  <input
                    type="radio"
                    name="estadoInicial"
                    value={est}
                    checked={formData.estadoInicial === est}
                    onChange={handleInputChange}
                    className="accent-[#8B4513] w-4 h-4 mr-3"
                  />
                  <span className="text-xs font-semibold text-gray-700">{est}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrarActivoPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico']}>
      <PermissionGuard module="activos" action="create">
        <RegistrarActivoContent />
      </PermissionGuard>
    </AuthGuard>
  );
}
