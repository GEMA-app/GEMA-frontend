'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { NuevoReporteInput, ReportePrioridad, ReporteTipo } from '@/types/reporte';

interface CrearReporteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: NuevoReporteInput) => Promise<void>;
  saving?: boolean;
}

const TIPOS: { value: ReporteTipo; label: string }[] = [
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'preventivo', label: 'Preventivo' },
];

const PRIORIDADES: { value: ReportePrioridad; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

export function CrearReporteModal({ isOpen, onClose, onSave, saving = false }: CrearReporteModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<ReporteTipo>('correctivo');
  const [prioridad, setPrioridad] = useState<ReportePrioridad>('media');
  const [asignado, setAsignado] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setTitulo('');
    setDescripcion('');
    setTipo('correctivo');
    setPrioridad('media');
    setAsignado('');
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave({ titulo, descripcion, tipo, prioridad, asignado });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crear-reporte-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#DED4C7] bg-[#F7F4EF] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EBE2D5] px-6 py-4">
          <h2 id="crear-reporte-title" className="text-xl font-bold text-gray-800">
            Crear reporte
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-white/70 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="reporte-titulo" className="mb-1 block text-sm font-semibold text-gray-700">
              Título
            </label>
            <input
              id="reporte-titulo"
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div>
            <label htmlFor="reporte-descripcion" className="mb-1 block text-sm font-semibold text-gray-700">
              Descripción
            </label>
            <textarea
              id="reporte-descripcion"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              required
              rows={3}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reporte-tipo" className="mb-1 block text-sm font-semibold text-gray-700">
                Tipo
              </label>
              <select
                id="reporte-tipo"
                value={tipo}
                onChange={(event) => setTipo(event.target.value as ReporteTipo)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              >
                {TIPOS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reporte-prioridad" className="mb-1 block text-sm font-semibold text-gray-700">
                Prioridad
              </label>
              <select
                id="reporte-prioridad"
                value={prioridad}
                onChange={(event) => setPrioridad(event.target.value as ReportePrioridad)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              >
                {PRIORIDADES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reporte-asignado" className="mb-1 block text-sm font-semibold text-gray-700">
              Asignado a
            </label>
            <input
              id="reporte-asignado"
              type="text"
              value={asignado}
              onChange={(event) => setAsignado(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#DED4C7] bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#E5A93D] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d19730] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
