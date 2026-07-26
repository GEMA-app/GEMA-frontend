'use client';

import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { PrioridadBadge } from './PrioridadBadge';
import { EstadoIndicator } from './EstadoIndicator';
import { TRANSICIONES_REPORTE } from '@/types/reporte';
import type { Reporte, ReporteEstado } from '@/types/reporte';

interface ReporteRowProps {
  reporte: Reporte;
  onEdit: (reporte: Reporte) => void;
  onDelete: (id: string) => void;
  onTransition: (id: string, status: ReporteEstado, version: number) => Promise<void>;
}

export function ReporteRow({ reporte, onEdit, onDelete, onTransition }: ReporteRowProps) {
  const [transitionsOpen, setTransitionsOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const available = TRANSICIONES_REPORTE[reporte.status] ?? [];

  const handleTransition = async (status: ReporteEstado) => {
    setTransitioning(true);
    try {
      await onTransition(reporte.id, status, reporte.version);
    } finally {
      setTransitioning(false);
      setTransitionsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile card */}
      <article
        className="md:hidden rounded-xl border border-[#DED4C7]/70 bg-[#EBE2D5] px-4 py-4 space-y-3 shadow-sm"
        aria-label={`Reporte ${reporte.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{reporte.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{reporte.description}</p>
            <p className="text-xs text-gray-500 mt-1">{reporte.location}</p>
          </div>
          <PrioridadBadge prioridad={reporte.priority} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#DED4C7]/60">
          <EstadoIndicator estado={reporte.status} />
          <span className="text-xs font-bold text-gray-800 truncate">{reporte.reported_by}</span>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#DED4C7]/60">
          <button type="button" onClick={() => onEdit(reporte)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#E5A93D] transition-colors px-2 py-1 rounded-lg hover:bg-white/60 cursor-pointer">
            <Edit2 size={14} /> Editar
          </button>
          <button type="button" onClick={() => { if (window.confirm(`¿Eliminar reporte "${reporte.title}"?`)) onDelete(reporte.id); }}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-white/60 cursor-pointer">
            <Trash2 size={14} /> Eliminar
          </button>
          {available.length > 0 && (
            <div className="relative ml-auto">
              <button type="button" onClick={() => setTransitionsOpen(!transitionsOpen)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded-lg hover:bg-white/60 cursor-pointer">
                {transitionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Cambiar estado
              </button>
              {transitionsOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-[#DED4C7] rounded-xl shadow-lg p-1 min-w-[140px]">
                  {available.map((s) => (
                    <button key={s} type="button" disabled={transitioning} onClick={() => handleTransition(s)}
                      className="block w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#F7F4EF] disabled:opacity-50 cursor-pointer transition-colors">
                      → {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Desktop row */}
      <div
        className="hidden md:grid grid-cols-12 gap-4 items-center rounded-xl border border-[#DED4C7]/70 bg-[#EBE2D5] px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
        role="row"
      >
        <div className="col-span-3 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{reporte.title}</p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{reporte.description}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{reporte.location}</p>
        </div>

        <div className="col-span-2">
          <PrioridadBadge prioridad={reporte.priority} />
        </div>

        <div className="col-span-2">
          <EstadoIndicator estado={reporte.status} />
        </div>

        <div className="col-span-2 text-right">
          <span className="text-xs sm:text-sm font-bold text-gray-800 truncate block">
            {reporte.reported_by}
          </span>
        </div>

        {/* Desktop actions */}
        <div className="col-span-3 flex items-center justify-end gap-1">
          <button type="button" onClick={() => onEdit(reporte)}
            className="p-1.5 hover:bg-white/60 rounded-lg transition-colors cursor-pointer" title="Editar">
            <Edit2 size={15} className="text-gray-500 hover:text-[#E5A93D]" />
          </button>
          <button type="button" onClick={() => { if (window.confirm(`¿Eliminar reporte "${reporte.title}"?`)) onDelete(reporte.id); }}
            className="p-1.5 hover:bg-white/60 rounded-lg transition-colors cursor-pointer" title="Eliminar">
            <Trash2 size={15} className="text-gray-500 hover:text-red-500" />
          </button>
          {available.length > 0 && (
            <div className="relative">
              <button type="button" onClick={() => setTransitionsOpen(!transitionsOpen)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-white/60 transition-colors cursor-pointer">
                Estado <ChevronDown size={12} />
              </button>
              {transitionsOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-[#DED4C7] rounded-xl shadow-lg p-1 min-w-[140px]">
                  {available.map((s) => (
                    <button key={s} type="button" disabled={transitioning} onClick={() => handleTransition(s)}
                      className="block w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#F7F4EF] disabled:opacity-50 cursor-pointer transition-colors">
                      → {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}