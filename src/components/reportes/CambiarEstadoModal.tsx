'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { ReporteEstado } from '@/types/reporte';
import { TRANSICIONES_REPORTE } from '@/types/reporte';

interface CambiarEstadoModalProps {
  estadoActual: ReporteEstado;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (nuevoEstado: ReporteEstado) => void;
}

const ESTADO_OPTIONS: { value: ReporteEstado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'atendido', label: 'Atendido' },
  { value: 'descartado', label: 'Descartado' },
];

export function CambiarEstadoModal({
  estadoActual,
  isSubmitting,
  onClose,
  onConfirm,
}: CambiarEstadoModalProps) {
  const transicionesValidas = TRANSICIONES_REPORTE[estadoActual] ?? [];
  const opcionesDisponibles = ESTADO_OPTIONS.filter(o => transicionesValidas.includes(o.value));

  const [seleccion, setSeleccion] = useState<ReporteEstado>(estadoActual);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <button
        type="button"
        className="absolute inset-0 bg-transparent border-none cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-md bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-lg text-gema-primary dark:text-white">
              Cambiar estado del reporte
            </h3>
            <p className="text-sm text-gema-primary/60 dark:text-white/50 mt-1">
              Seleccione el nuevo estado para este reporte.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-lg text-gema-primary/50 hover:bg-gema-primary/5 dark:text-white/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {opcionesDisponibles.length === 0 ? (
            <p className="text-sm text-gema-primary/60 dark:text-white/50 text-center py-4">
              No hay transiciones disponibles para este estado.
            </p>
          ) : opcionesDisponibles.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                seleccion === option.value
                  ? 'border-gema-accent bg-gema-accent/10'
                  : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <input
                type="radio"
                name="nuevoEstadoReporte"
                value={option.value}
                checked={seleccion === option.value}
                onChange={() => setSeleccion(option.value)}
                className="accent-gema-accent w-4 h-4"
              />
              <span className="text-sm font-medium text-gema-primary dark:text-white">
                {option.label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting || seleccion === estadoActual}
            onClick={() => onConfirm(seleccion)}
            className="px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 text-sm font-semibold transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar cambio'}
          </button>
        </div>
      </div>
    </div>
  );
}
