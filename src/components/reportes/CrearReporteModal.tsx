'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ActualizarReporteInput, NuevoReporteInput, Reporte, ReportePrioridad } from '@/types/reporte';

interface CrearReporteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: NuevoReporteInput) => Promise<void>;
  onUpdate?: (id: string, input: ActualizarReporteInput) => Promise<void>;
  saving?: boolean;
  reporte?: Reporte;
  ubicaciones?: { id: string; nombre: string }[];
  tecnicos?: { id: string; nombre: string }[];
}

const PRIORIDADES: { value: ReportePrioridad; label: string }[] = [
  { value: 'critica', label: 'Critica' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

export function CrearReporteModal({ isOpen, onClose, onSave, onUpdate, saving = false, reporte, ubicaciones = [], tecnicos = [] }: CrearReporteModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<ReportePrioridad>('media');
  const [reported_by, setReportedBy] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!reporte;

  useEffect(() => {
    if (!isOpen) return;
    if (reporte) {
      setTitle(reporte.title);
      setDescription(reporte.description);
      setLocation(reporte.location);
      setPriority(reporte.priority);
      setReportedBy(reporte.reported_by);
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      setPriority('media');
      setReportedBy('');
    }
    setError(null);
  }, [isOpen, reporte]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const trimmedLoc = location.trim();
    const trimmedBy = reported_by.trim();

    if (!trimmedTitle || !trimmedDesc || !trimmedLoc || !trimmedBy) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      if (isEditing && onUpdate && reporte) {
        await onUpdate(reporte.id, {
          title: trimmedTitle,
          description: trimmedDesc,
          location: trimmedLoc,
          priority,
          reported_by: trimmedBy,
          version: reporte.version,
        });
      } else {
        await onSave({ title: trimmedTitle, description: trimmedDesc, location: trimmedLoc, priority, reported_by: trimmedBy });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el reporte.');
    }
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
            {isEditing ? 'Editar reporte de falla' : 'Crear reporte de falla'}
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
            <label htmlFor="reporte-title" className="mb-1 block text-sm font-semibold text-gray-700">
              Titulo
            </label>
            <input
              id="reporte-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={200}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div>
            <label htmlFor="reporte-description" className="mb-1 block text-sm font-semibold text-gray-700">
              Descripcion
            </label>
            <textarea
              id="reporte-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] resize-none"
            />
          </div>

          {/* Ubicacion como select */}
          <div>
            <label htmlFor="reporte-location" className="mb-1 block text-sm font-semibold text-gray-700">
              Ubicacion
            </label>
            <select
              id="reporte-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            >
              <option value="">Seleccionar ubicacion...</option>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.nombre}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reporte-priority" className="mb-1 block text-sm font-semibold text-gray-700">
                Prioridad
              </label>
              <select
                id="reporte-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as ReportePrioridad)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              >
                {PRIORIDADES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reportado por como select con tecnicos */}
            <div>
              <label htmlFor="reporte-reported_by" className="mb-1 block text-sm font-semibold text-gray-700">
                Reportado por
              </label>
              <select
                id="reporte-reported_by"
                value={reported_by}
                onChange={(event) => setReportedBy(event.target.value)}
                required
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              >
                <option value="">Seleccionar tecnico...</option>
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2" role="alert">
              {error}
            </p>
          )}

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
              {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}