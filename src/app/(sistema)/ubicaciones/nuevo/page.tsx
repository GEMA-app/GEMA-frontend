'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import { createUbicacion } from '@/services/ubicaciones';
import type { TipoUbicacion, Ubicacion } from '@/types/ubicacion';

const TIPO_PADRE_PERMITE: Record<TipoUbicacion, TipoUbicacion | null> = {
  sede: null,
  planta: 'sede',
  area: 'planta',
  seccion: 'area',
};

interface FormState {
  nombre: string;
  tipo: TipoUbicacion;
  parentId: string;
  descripcion: string;
}

const initialFormState: FormState = {
  nombre: '',
  tipo: 'area',
  parentId: '',
  descripcion: '',
};

function NuevaUbicacionPageContent() {
  const { ubicaciones, loading: loadingUbicaciones } = useUbicaciones();
  const ubicacionOptions = useMemo(
    () => flattenUbicacionesForSelect(ubicaciones),
    [ubicaciones],
  );

  const typeMap = useMemo(() => {
    const map = new Map<string, Ubicacion>();
    const walk = (items: Ubicacion[]) => {
      for (const item of items) { map.set(item.id, item); if (item.hijos) walk(item.hijos); }
    };
    walk(ubicaciones);
    return map;
  }, [ubicaciones]);

  const router = useRouter();

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parentTipo = TIPO_PADRE_PERMITE[formData.tipo];

  const parentOptions = useMemo(() => {
    if (!parentTipo) return [];
    return ubicacionOptions.filter((opt) => {
      const u = typeMap.get(opt.id);
      return u?.tipo === parentTipo;
    });
  }, [parentTipo, ubicacionOptions, typeMap]);

  const isSede = formData.tipo === 'sede';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'tipo' ? { parentId: '' } : {}),
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitStatus('');
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.nombre.trim()) next.nombre = 'El nombre de la ubicación es obligatorio.';
    if (parentTipo && !formData.parentId) next.parentId = `Debe seleccionar una ${parentTipo} como padre.`;
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
      await createUbicacion({
        nombre: formData.nombre,
        tipo: formData.tipo,
        parentId: formData.parentId || null,
        descripcion: formData.descripcion || null,
      });
      setSubmitStatus('Ubicación guardada correctamente.');
      setTimeout(() => router.push('/ubicaciones'), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar la ubicación';
      setSubmitStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader
        title="Ubicaciones / Nueva ubicación"
        variant="activos"
      />

      <div className="mb-6">
        <Link href="/ubicaciones" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
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
            <h2 className="text-2xl font-bold text-gray-900">Registrar Nueva Ubicación</h2>
            <p className="text-gray-500 text-xs mt-1">Complete los detalles para agregar una ubicación al árbol jerárquico.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/ubicaciones" className="px-6 py-2.5 bg-[#F3D58D] text-gray-900 font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
              Cancelar
            </Link>
            <button
              type="submit"
              form="nueva-ubicacion-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4 text-black" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'guardar ubicación'}
            </button>
          </div>
        </div>

        <form id="nueva-ubicacion-form" onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="nombre">Nombre de la Ubicación</label>
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
            <label className="block text-xs text-gray-500 mb-1" htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm border-gray-400"
            >
              <option value="sede">Sede</option>
              <option value="planta">Planta</option>
              <option value="area">Área</option>
              <option value="seccion">Sección</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="parentId">
              Ubicación Padre {parentTipo ? `(solo ${parentTipo}s)` : ''}
            </label>
            <select
              id="parentId"
              name="parentId"
              value={formData.parentId}
              onChange={handleInputChange}
              disabled={loadingUbicaciones || isSede}
              className={`w-full bg-transparent border-b py-1.5 outline-none focus:border-[#E59D12] transition-colors text-sm ${isSede ? 'border-gray-200 text-gray-400' : 'border-gray-400'}`}
            >
              <option value="">{isSede ? 'Una sede no puede tener padre' : parentTipo ? `Seleccione una ${parentTipo}` : 'Ninguna (raíz)'}</option>
              {!isSede && parentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {isSede && <p className="text-xs text-amber-600 mt-1">Las sedes son ubicaciones raíz y no pueden tener padre.</p>}
            {errors.parentId && <p className="text-xs text-red-600 mt-1">{errors.parentId}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 bg-transparent p-4 outline-none focus:border-[#E59D12] transition-colors text-sm resize-none shadow-inner"
            />
          </div>

          {submitStatus && (
            <p className={`text-sm ${submitStatus.includes('Error') || submitStatus.includes('error') ? 'text-red-600' : 'text-emerald-700'}`}>{submitStatus}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default function NuevaUbicacionPage() {
  return (
    <AuthGuard roleRequired={['admin']}>
      <NuevaUbicacionPageContent />
    </AuthGuard>
  );
}
