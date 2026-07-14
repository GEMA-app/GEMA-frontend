'use client';

/**
 * Formulario para dar de alta un activo nuevo.
 *
 * Tiene tres secciones (info general, ubicación/adquisición, detalles)
 * más un selector lateral de estado inicial. Al guardar valida, llama a
 * `createActivo` y redirige al listado tras 800ms.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  MapPin,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import { createActivo } from '@/services/activos';
import type { CreateActivoForm } from '@/types/activo';

// Valores iniciales
const initialFormState: CreateActivoForm & { garantiaHasta: string; detalles: string } = {
  nombre: '',
  codigo: '',
  marca: '',
  ubicacion: '',
  fechaCompra: '',
  valorMonetario: '',
  moneda: 'USD',
  estadoInicial: 'Operativo',
  garantiaHasta: '', // TODO: habilitar cuando el backend soporte garantías
  detalles: '',      // TODO: enviar cuando el backend acepte observaciones
};

// Página 
export default function RegistrarActivoPage() {
  const { ubicaciones, loading: loadingUbicaciones, error: ubicacionesError } = useUbicaciones();

  // Ubicaciones aplanadas para el <select>, con sangría según jerarquía
  const ubicacionOptions = useMemo(
    () => flattenUbicacionesForSelect(ubicaciones),
    [ubicaciones],
  );

  const router = useRouter();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fechaCompraRef = useRef<HTMLInputElement | null>(null);
  const garantiaRef = useRef<HTMLInputElement | null>(null);

  // Actualiza formData y limpia el error del campo al tipear
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  // Validación
  const validateForm = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      nextErrors.nombre = 'El nombre del activo es obligatorio.';
    }
    if (!formData.codigo.trim()) {
      nextErrors.codigo = 'El código de inventario es obligatorio.';
    }
    if (!formData.marca.trim()) {
      nextErrors.marca = 'Debes indicar la marca o el fabricante.';
    }
    if (!formData.fechaCompra) {
      nextErrors.fechaCompra = 'La fecha de compra es obligatoria.';
    }

    // La garantía no puede ser anterior a la compra
    if (formData.fechaCompra && formData.garantiaHasta) {
      const compra = new Date(formData.fechaCompra);
      const garantia = new Date(formData.garantiaHasta);
      if (garantia < compra) {
        nextErrors.garantiaHasta = 'La garantía no puede ser anterior a la fecha de compra.';
      }
    }

    return nextErrors;
  };

  // Submit 
  // Valida → envía → redirige al listado si todo sale bien
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitStatus('Corrige los errores antes de guardar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Guardando...');

    try {
      await createActivo({
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

  // Render 
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader
        title="Activos / Nuevo activo"
        variant="activos"
        searchPlaceholder="Buscar activo..."
        searchLabel="Buscar activos"
      />

      {/* Link de regreso */}
      <div className="mb-6">
        <Link
          href="/activos"
          className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Tarjeta del formulario */}
      <div
        className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8"
        style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}
      >
        {/* Título + botones */}
        <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrar nuevo activo</h2>
            <p className="text-gray-500 text-xs mt-1">Llena los datos del equipo que vas a registrar.</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/activos"
              className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all flex items-center justify-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              form="registrar-activo-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'Guardar activo'}
            </button>
          </div>
        </div>

        {/* Formulario (2 cols) + estado inicial (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <form id="registrar-activo-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">

            {/* Info general: nombre, código, marca */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Información general</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Nombre del activo</label>
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
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="codigo">Código de inventario</label>
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
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="marca">Marca / Fabricante</label>
                  <input
                    id="marca"
                    name="marca"
                    type="text"
                    value={formData.marca}
                    onChange={handleInputChange}
                    className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.marca ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.marca && <p className="text-xs text-red-600 mt-1">{errors.marca}</p>}
                </div>
              </div>
            </div>

            {/* Ubicación y adquisición */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <MapPin className="w-5 h-5" />
                <span className="text-gray-800">Ubicación y adquisición</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="ubicacion">Ubicación física</label>
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
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="fechaCompra">Fecha de compra</label>
                  <input
                    id="fechaCompra"
                    name="fechaCompra"
                    type="date"
                    ref={fechaCompraRef}
                    value={formData.fechaCompra}
                    onChange={handleInputChange}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    className={`date-input w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${errors.fechaCompra ? 'border-red-500' : 'border-gray-400'}`}
                  />
                  {errors.fechaCompra && <p className="text-xs text-red-600 mt-1">{errors.fechaCompra}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="valorMonetario">Valor monetario</label>
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
                <div>
                  {/* TODO: habilitar cuando el backend soporte garantías */}
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="garantiaHasta">Garantía hasta</label>
                  <input
                    id="garantiaHasta"
                    name="garantiaHasta"
                    type="date"
                    ref={garantiaRef}
                    value={formData.garantiaHasta}
                    onChange={handleInputChange}
                    disabled={true}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    className="date-input w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-300 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Detalles (texto libre) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                <FileText className="w-5 h-5" />
                <span className="text-gray-800">Detalles adicionales</span>
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
              <p className="text-[11px] text-gray-500 font-medium">Formato de fecha: DD/MM/AAAA</p>

              {/* Mensaje de éxito o error */}
              {submitStatus && (
                <p className={`text-sm ${Object.keys(errors).length === 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {submitStatus}
                </p>
              )}
            </div>

          </form>

          {/* Tarjeta lateral de estado inicial */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md flex flex-col items-center">
            <h3 className="text-gray-800 font-bold text-center mb-6 text-base">Estado inicial</h3>

            <div className="w-full space-y-3">
              {(['Operativo', 'En mantenimiento', 'Para revisión'] as const).map((estadoOpt) => (
                <label
                  key={estadoOpt}
                  className="flex items-center px-4 py-3 border border-gray-200 rounded-xl cursor-pointer transition-all bg-white"
                >
                  <input
                    type="radio"
                    name="estadoInicial"
                    value={estadoOpt}
                    checked={formData.estadoInicial === estadoOpt}
                    onChange={handleInputChange}
                    className="accent-[#8B4513] w-4 h-4 mr-3"
                  />
                  <span className="text-xs font-semibold text-gray-700">{estadoOpt}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
