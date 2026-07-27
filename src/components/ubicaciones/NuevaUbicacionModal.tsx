'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { TipoUbicacion, ProcesoUbicacion, EstadoUbicacion, Ubicacion } from '@/types/ubicacion';

interface ModalForm {
  nombre: string;
  tipo: TipoUbicacion;
  jerarquia: string;
  proceso: ProcesoUbicacion;
  estado: EstadoUbicacion;
  parentId: string;
}

interface NuevaUbicacionModalProps {
  isOpen: boolean;
  ubicaciones: Ubicacion[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre: string; jerarquia: string; tipo: TipoUbicacion; parentId?: string }) => Promise<void> | void;
}

const PROCESO_OPTIONS: { value: ProcesoUbicacion; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

const ESTADO_OPTIONS: { value: EstadoUbicacion; label: string }[] = [
  { value: 'completado', label: 'Completado' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'pendiente', label: 'Pendiente' },
];

const EMPTY_FORM: ModalForm = {
  nombre: '',
  tipo: 'area',
  jerarquia: '',
  proceso: 'media',
  estado: 'pendiente',
  parentId: '',
};

function flattenUbicaciones(ubicaciones: Ubicacion[], depth = 0): { id: string; label: string }[] {
  return ubicaciones.flatMap((ubicacion) => {
    const prefix = depth > 0 ? `${'— '.repeat(depth)}` : '';
    const current = { id: ubicacion.id, label: `${prefix}${ubicacion.nombre}` };
    const children = ubicacion.hijos ? flattenUbicaciones(ubicacion.hijos, depth + 1) : [];
    return [current, ...children];
  });
}

const labelClass = 'block text-xs font-semibold text-gema-primary dark:text-white/80 mb-1';
const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent';

export function NuevaUbicacionModal({
  isOpen,
  ubicaciones,
  isSubmitting = false,
  onClose,
  onSubmit,
}: NuevaUbicacionModalProps) {
  const [form, setForm] = useState<ModalForm>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) setForm(EMPTY_FORM);
  }, [isOpen]);

  if (!isOpen) return null;

  const parentOptions = flattenUbicaciones(ubicaciones);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    await onSubmit({
      nombre: form.nombre.trim(),
      jerarquia: form.jerarquia.trim(),
      tipo: form.tipo,
      parentId: form.parentId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-heading text-xl font-bold text-gema-primary dark:text-white">Nueva ubicación</h3>
            <p className="text-xs text-gema-primary/60 dark:text-white/50 mt-1">Registrar un lugar en el árbol jerárquico</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className={labelClass}>Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, nombre: event.target.value }))}
              placeholder="Ej. Planta Principal / Zona A"
              className={inputClass}
              required
            />
          </label>

          <label className="block">
            <span className={labelClass}>Jerarquía</span>
            <input
              type="text"
              value={form.jerarquia}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, jerarquia: event.target.value }))}
              placeholder="Ej. ZONA 123"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Tipo</span>
            <select
              value={form.tipo}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, tipo: event.target.value as TipoUbicacion }))}
              className={inputClass}
            >
              <option value="sede">Sede</option>
              <option value="planta">Planta</option>
              <option value="area">Área</option>
              <option value="seccion">Sección</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Ubicación padre (opcional)</span>
            <select
              value={form.parentId ?? ''}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, parentId: event.target.value }))}
              className={inputClass}
            >
              <option value="">Sin padre (nivel raíz)</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Proceso</span>
              <select
                value={form.proceso}
                onChange={(event) => setForm((current: ModalForm) => ({ ...current, proceso: event.target.value as ProcesoUbicacion }))}
                className={inputClass}
              >
                {PROCESO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Estado</span>
              <select
                value={form.estado}
                onChange={(event) => setForm((current: ModalForm) => ({ ...current, estado: event.target.value as EstadoUbicacion }))}
                className={inputClass}
              >
                {ESTADO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar ubicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
