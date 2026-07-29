'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import { ApiError } from '@/lib/api';
import { Select } from '@/components/ui/Select';
import type { TipoUbicacion, Ubicacion } from '@/types/ubicacion';

const labelClass = 'block text-[13px] font-semibold text-gema-primary dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40 disabled:opacity-50 disabled:cursor-not-allowed';

export default function NuevaUbicacionPage() {
  const router = useRouter();
  const { ubicaciones, loading: loadingUbicaciones, createUbicacion } = useUbicaciones();
  const ubicacionOptions = useMemo(
    () => flattenUbicacionesForSelect(ubicaciones),
    [ubicaciones],
  );

  const sedeIds = useMemo(() => {
    const ids = new Set<string>();
    const walk = (items: Ubicacion[]) => {
      for (const item of items) {
        if (item.tipo?.toLowerCase() === 'sede') ids.add(item.id);
        if (item.hijos) walk(item.hijos);
      }
    };
    walk(ubicaciones);
    return ids;
  }, [ubicaciones]);

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'area' as TipoUbicacion,
    parentId: '',
    descripcion: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentOptions = useMemo(() => {
    if (formData.tipo === 'sede') return [];
    if (formData.tipo === 'planta') {
      return ubicacionOptions.filter((opt) => sedeIds.has(opt.id));
    }
    return ubicacionOptions;
  }, [formData.tipo, ubicacionOptions, sedeIds]);

  const isSede = formData.tipo === 'sede';

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'tipo' && value === 'sede' ? { parentId: '' } : {}),
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre de la ubicación es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createUbicacion({
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        parentId: formData.parentId || null,
        descripcion: formData.descripcion.trim() || null,
      });
      router.push('/ubicaciones');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar la ubicación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/ubicaciones"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a ubicaciones
        </Link>
      </div>

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Nueva ubicación
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="nombre">
              Nombre de la ubicación*
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej. Planta Principal / Zona A"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="tipo">
              Tipo de ubicación*
            </label>
            <Select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  tipo: value as TipoUbicacion,
                  ...(value === 'sede' ? { parentId: '' } : {}),
                }));
                setError(null);
              }}
              options={[
                { value: 'sede', label: 'Sede' },
                { value: 'planta', label: 'Planta' },
                { value: 'area', label: 'Área' },
                { value: 'seccion', label: 'Sección' },
              ]}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="parentId">
              Ubicación padre
            </label>
            <Select
              id="parentId"
              name="parentId"
              value={formData.parentId}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, parentId: value }));
                setError(null);
              }}
              disabled={loadingUbicaciones || isSede}
              options={[
                {
                  value: '',
                  label: isSede
                    ? 'Una sede no tiene ubicación padre'
                    : formData.tipo === 'planta'
                      ? 'Selecciona una sede'
                      : 'Ninguna (Nivel raíz)',
                },
                ...(!isSede
                  ? parentOptions.map((opt) => ({ value: opt.id, label: opt.label }))
                  : []),
              ]}
            />
            {isSede && (
              <p className="text-xs text-gema-primary/60 dark:text-white/50 mt-1">
                Las sedes son el nivel raíz y no requieren ubicación padre.
              </p>
            )}
            {formData.tipo === 'planta' && !isSede && parentOptions.length === 0 && (
              <p className="text-xs text-gema-accent-dark dark:text-gema-accent mt-1">
                No hay sedes disponibles. Registra primero una sede.
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Detalles sobre la ubicación..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/ubicaciones"
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'Guardar ubicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
