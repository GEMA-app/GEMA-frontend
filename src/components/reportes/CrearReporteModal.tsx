'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getActivos } from '@/services/activos';
import { getUserName } from '@/lib/auth';
import type { Activo } from '@/types/activo';
import type { NuevoReporteInput, ReportePrioridad } from '@/types/reporte';

interface CrearReporteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: NuevoReporteInput) => Promise<void>;
  saving?: boolean;
}

const PRIORIDAD_OPTIONS: { value: ReportePrioridad; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
  { value: 'critica', label: 'Crítica' },
];

export function CrearReporteModal({
  isOpen,
  onClose,
  onSave,
  saving = false,
}: CrearReporteModalProps) {
  const [activoId, setActivoId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ReportePrioridad>('media');
  const [activos, setActivos] = useState<Activo[]>([]);
  const [loadingActivos, setLoadingActivos] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setActivoId('');
    setDescription('');
    setPriority('media');
    let cancelled = false;
    setLoadingActivos(true);
    getActivos({ perPage: 200 })
      .then((res) => {
        if (cancelled) return;
        setActivos(res.activos);
      })
      .catch(() => {
        // non-critical
      })
      .finally(() => {
        if (!cancelled) setLoadingActivos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedActivo = activos.find((a) => a.id === activoId);
    const location = selectedActivo ? selectedActivo.ubicacion || selectedActivo.nombre : 'General';
    const title = selectedActivo
      ? `Falla en ${selectedActivo.nombre}`
      : description.length > 40
        ? `${description.slice(0, 40)}...`
        : description;

    await onSave({
      title,
      description,
      location,
      priority,
      reported_by: getUserName() || 'Usuario Sistema',
      activo_id: activoId || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crear-reporte-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark shadow-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2
              id="crear-reporte-title"
              className="font-heading font-bold text-xl text-gema-primary dark:text-white"
            >
              Nuevo reporte de falla
            </h2>
            <p className="text-sm text-gema-primary/60 dark:text-white/50 mt-1">
              Complete la información de la incidencia detectada
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gema-primary/50 hover:bg-gema-primary/5 dark:text-white/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reporte-activo"
              className="block text-sm font-semibold text-gema-primary dark:text-white mb-1.5"
            >
              Activo
            </label>
            <select
              id="reporte-activo"
              value={activoId}
              onChange={(e) => setActivoId(e.target.value)}
              disabled={loadingActivos}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent"
            >
              <option value="">
                {loadingActivos ? 'Cargando activos...' : 'Seleccionar activo (opcional)'}
              </option>
              {activos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.serial} — {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reporte-description"
              className="block text-sm font-semibold text-gema-primary dark:text-white mb-1.5"
            >
              Descripción de falla <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reporte-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describa detalladamente el problema o falla presentada..."
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="reporte-priority"
              className="block text-sm font-semibold text-gema-primary dark:text-white mb-1.5"
            >
              Prioridad
            </label>
            <select
              id="reporte-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ReportePrioridad)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent"
            >
              {PRIORIDAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 disabled:opacity-60 text-gray-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Crear reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}