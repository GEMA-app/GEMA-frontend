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
        aria-label={`Reporte ${reporte.codigo} ${reporte.titulo}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-block rounded-md bg-white/70 px-2 py-1 text-[10px] font-bold text-gray-600 mb-2">
              {reporte.codigo}
            </span>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{reporte.titulo}</h3>
            <p className="text-xs text-gray-600 mt-1">{reporte.descripcion}</p>
          </div>
          <PrioridadBadge prioridad={reporte.prioridad} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#DED4C7]/60">
          <EstadoIndicator estado={reporte.estado} />
          <span className="text-xs font-bold text-gray-800 truncate">{reporte.asignado}</span>
        </div>
      </article>

      <div
        className="hidden md:grid grid-cols-12 gap-4 items-center rounded-xl border border-[#DED4C7]/70 bg-[#EBE2D5] px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
        role="row"
      >
        <div className="col-span-1">
          <span className="inline-block rounded-md bg-white/70 px-2 py-1 text-xs font-bold text-gray-600">
            {reporte.codigo}
          </span>
        </div>

        <div className="col-span-4 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{reporte.titulo}</p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{reporte.descripcion}</p>
        </div>

        <div className="col-span-2">
          <PrioridadBadge prioridad={reporte.prioridad} />
        </div>

        <div className="col-span-3">
          <EstadoIndicator estado={reporte.estado} />
        </div>

        <div className="col-span-2 text-right">
          <span className="text-xs sm:text-sm font-bold text-gray-800 truncate block">
            {reporte.asignado}
          </span>
        </div>
      </div>
    </>
  );
}
