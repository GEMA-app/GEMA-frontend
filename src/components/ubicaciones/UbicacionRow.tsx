import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Ubicacion } from '@/types/ubicacion';

interface UbicacionRowProps {
  ubicacion: Ubicacion;
  depth?: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
}

export function UbicacionRow({
  ubicacion,
  depth = 0,
  isExpanded,
  hasChildren,
  onToggle,
}: UbicacionRowProps) {
  const paddingLeft = depth > 0 ? `${depth * 1.75}rem` : undefined;
  const rowId = `ubicacion-row-${ubicacion.id}`;

  return (
    <article
      id={rowId}
      className="bg-[#EBE2D5] rounded-xl px-4 sm:px-6 py-4 shadow-sm border border-[#DED4C7]/50 hover:shadow-md transition-shadow"
      aria-label={`Ubicación ${ubicacion.nombre}`}
    >
      <div className="md:hidden space-y-3">
        <div className="flex items-start gap-2" style={{ paddingLeft }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={onToggle}
              className="mt-0.5 p-0.5 rounded-md text-gray-600 hover:bg-white/60 transition-colors cursor-pointer flex-shrink-0"
              aria-expanded={isExpanded}
              aria-controls={`${rowId}-children`}
              aria-label={isExpanded ? `Colapsar ${ubicacion.nombre}` : `Expandir ${ubicacion.nombre}`}
            >
              {isExpanded ? <ChevronDown size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
            </button>
          ) : (
            <span className="w-5 flex-shrink-0" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 text-sm leading-tight">{ubicacion.nombre}</p>
            {ubicacion.descripcion && (
              <p className="text-xs text-gray-500 mt-1 leading-snug">{ubicacion.descripcion}</p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Tipo</dt>
            <dd className="text-gray-700 text-right capitalize">{ubicacion.tipo}</dd>
          </div>
        </dl>
      </div>

      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-6 min-w-0" style={{ paddingLeft }}>
          <div className="flex items-start gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={onToggle}
                className="mt-0.5 p-0.5 rounded-md text-gray-600 hover:bg-white/60 transition-colors cursor-pointer flex-shrink-0"
                aria-expanded={isExpanded}
                aria-controls={`${rowId}-children`}
                aria-label={isExpanded ? `Colapsar ${ubicacion.nombre}` : `Expandir ${ubicacion.nombre}`}
              >
                {isExpanded ? <ChevronDown size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
              </button>
            ) : (
              <span className="w-5 flex-shrink-0" aria-hidden />
            )}
            <div className="min-w-0">
              <div className="font-bold text-gray-800 text-sm leading-tight truncate">
                {ubicacion.nombre}
              </div>
              {ubicacion.descripcion && (
                <div className="text-xs text-gray-500 mt-1 leading-snug truncate">
                  {ubicacion.descripcion}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-6 text-sm font-medium text-gray-700 leading-snug capitalize">
          {ubicacion.tipo}
        </div>
      </div>

      {hasChildren && (
        <div id={`${rowId}-children`} className="sr-only" aria-live="polite">
          {isExpanded ? 'Sububicaciones visibles' : 'Sububicaciones ocultas'}
        </div>
      )}
    </article>
  );
}

