'use client';

import { PrioridadBadge } from './PrioridadBadge';
import { EstadoIndicator } from './EstadoIndicator';
import type { Reporte } from '@/types/reporte';

interface ReporteRowProps {
  reporte: Reporte;
}

export function ReporteRow({ reporte }: ReporteRowProps) {
  return (
    <>
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
      </article>

      <div
        className="hidden md:grid grid-cols-12 gap-4 items-center rounded-xl border border-[#DED4C7]/70 bg-[#EBE2D5] px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
        role="row"
      >
        <div className="col-span-4 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{reporte.title}</p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{reporte.description}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{reporte.location}</p>
        </div>

        <div className="col-span-2">
          <PrioridadBadge prioridad={reporte.priority} />
        </div>

        <div className="col-span-3">
          <EstadoIndicator estado={reporte.status} />
        </div>

        <div className="col-span-3 text-right">
          <span className="text-xs sm:text-sm font-bold text-gray-800 truncate block">
            {reporte.reported_by}
          </span>
        </div>
      </div>
    </>
  );
}