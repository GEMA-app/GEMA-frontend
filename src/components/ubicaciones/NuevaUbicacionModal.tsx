'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import type { NuevaUbicacionForm, TipoUbicacion, Ubicacion } from '@/types/ubicacion';

const TIPO_HIJO_PERMITE: Record<TipoUbicacion, TipoUbicacion | null> = {
  sede: null,
  planta: 'sede',
  area: 'planta',
  seccion: 'area',
};

interface ModalForm {
  nombre: string;
  tipo: TipoUbicacion;
  descripcion: string;
  parentId: string;
}

interface NuevaUbicacionModalProps {
  isOpen: boolean;
  ubicaciones: Ubicacion[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: NuevaUbicacionForm) => Promise<void>;
}

const EMPTY_FORM: ModalForm = {
  nombre: '',
  tipo: 'area',
  descripcion: '',
  parentId: '',
};

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

  const parentTipo = TIPO_HIJO_PERMITE[form.tipo];

  const parentOptions = useMemo(() => {
    const all = flattenUbicacionesForSelect(ubicaciones);
    if (!parentTipo) return [];
    return all.filter((opt) => {
      const find = (items: Ubicacion[]): boolean =>
        items.some((u) => u.id === opt.id || (u.hijos && find(u.hijos)));
      return find(ubicaciones);
    });
  }, [ubicaciones, parentTipo]);

  const parentMap = useMemo(() => {
    const map = new Map<string, Ubicacion>();
    const walk = (items: Ubicacion[]) => {
      for (const u of items) { map.set(u.id, u); if (u.hijos) walk(u.hijos); }
    };
    walk(ubicaciones);
    return map;
  }, [ubicaciones]);

  const filteredOptions = useMemo(() => {
    if (!parentTipo) return [];
    return parentOptions.filter((opt) => {
      const u = parentMap.get(opt.id);
      return u?.tipo === parentTipo;
    });
  }, [parentOptions, parentMap, parentTipo]);

  // Reset parentId si el padre seleccionado ya no es válido
  useEffect(() => {
    if (form.parentId && parentTipo) {
      const u = parentMap.get(form.parentId);
      if (u?.tipo !== parentTipo) {
        setForm((prev) => ({ ...prev, parentId: '' }));
      }
    }
  }, [form.parentId, form.tipo, parentTipo, parentMap]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    await onSubmit({
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      descripcion: form.descripcion.trim() || undefined,
      parentId: form.parentId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-lg bg-[#F7F4EF] rounded-[2rem] border border-[#EBE2D5] shadow-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Nueva ubicación</h3>
            <p className="text-sm text-gray-500 mt-1">Registrar un lugar para mantenimientos</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-[#DED4C7] bg-white text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, nombre: event.target.value }))}
              placeholder="Ej. Planta A / Área 1"
              className="mt-1 w-full rounded-xl border border-[#DED4C7] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Tipo</span>
            <select
              value={form.tipo}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, tipo: event.target.value as TipoUbicacion, parentId: '' }))}
              className="mt-1 w-full rounded-xl border border-[#DED4C7] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            >
              <option value="sede">Sede</option>
              <option value="planta">Planta</option>
              <option value="area">Área</option>
              <option value="seccion">Sección</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Ubicación padre {parentTipo ? `(solo ${parentTipo})` : '(opcional)'}</span>
            <select
              value={form.parentId ?? ''}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, parentId: event.target.value }))}
              disabled={!parentTipo}
              className="mt-1 w-full rounded-xl border border-[#DED4C7] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{parentTipo ? `Seleccione una ${parentTipo}` : 'Sin padre (raíz)'}</option>
              {filteredOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Descripción (opcional)</span>
            <textarea
              value={form.descripcion}
              onChange={(event) => setForm((current: ModalForm) => ({ ...current, descripcion: event.target.value }))}
              placeholder="Descripción opcional de la ubicación..."
              className="mt-1 w-full rounded-xl border border-[#DED4C7] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] resize-none"
              rows={3}
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#DED4C7] bg-white text-sm font-semibold text-gray-700 hover:bg-[#F7F4EF] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#E5A93D] hover:bg-[#d19730] disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-semibold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar ubicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
