'use client';

import { Pencil, Trash2, Package } from 'lucide-react';
import type { Repuesto } from '@/types/repuesto';

interface RepuestoRowProps {
  repuesto: Repuesto;
  onEdit: (repuesto: Repuesto) => void;
  onDelete: (id: string) => void;
}

export function RepuestoRow({ repuesto, onEdit, onDelete }: RepuestoRowProps) {
  return (
    <>
      <article
        className="md:hidden bg-[#EBE2D5] rounded-xl px-4 py-4 shadow-sm border border-[#DED4C7]/50 space-y-4"
        aria-label={`Repuesto ${repuesto.articuloId}`}
      >
        <div className="flex items-start gap-3">
          <div className="bg-[#C3B9AA] text-gray-800 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Package size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 text-base leading-tight truncate">{repuesto.articuloId}</p>
            <p className="text-xs text-gray-500 mt-0.5">{repuesto.ubicacion}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm bg-white/40 rounded-xl p-3">
          <div className="flex justify-between items-center gap-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Stock</dt>
            <dd className="font-semibold text-gray-800">
              {repuesto.stockActual} / {repuesto.stockMinimo}
            </dd>
          </div>
          <div className="flex justify-between items-center gap-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Precio</dt>
            <dd className="font-semibold text-gray-800">
              {repuesto.moneda} {repuesto.precioUnitario}
            </dd>
          </div>
        </dl>

        <div className="flex justify-end items-center gap-2 pt-1 border-t border-[#DED4C7]/60">
          <button
            type="button"
            onClick={() => onEdit(repuesto)}
            className="p-2 border border-teal-600/20 bg-white/50 text-teal-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
            aria-label="Editar repuesto"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(repuesto.id)}
            className="p-2 border border-red-500/20 bg-white/50 text-red-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
            aria-label="Eliminar repuesto"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </article>

      <div className="hidden md:grid bg-[#EBE2D5] rounded-xl px-6 py-4 grid-cols-12 gap-4 items-center shadow-sm border border-[#DED4C7]/50 hover:shadow-md transition-shadow">
        <div className="col-span-3 flex items-center space-x-3 min-w-0">
          <div className="bg-[#C3B9AA] text-gray-800 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Package size={20} />
          </div>
          <div className="truncate">
            <div className="font-bold text-gray-800 text-sm leading-tight truncate">{repuesto.articuloId}</div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">{repuesto.proveedorId}</div>
          </div>
        </div>

        <div className="col-span-2 text-sm text-gray-700 font-medium truncate">
          {repuesto.ubicacion}
        </div>

        <div className="col-span-2 text-sm">
          <span className="font-semibold text-gray-800">{repuesto.stockActual}</span>
          <span className="text-gray-500"> / </span>
          <span className="font-semibold">{repuesto.stockMinimo}</span>
        </div>

        <div className="col-span-2 text-sm font-semibold text-gray-800">
          {repuesto.moneda} {repuesto.precioUnitario}
        </div>

        <div className="col-span-3 flex justify-end items-center space-x-2">
          <button
            type="button"
            onClick={() => onEdit(repuesto)}
            className="p-2 border border-teal-600/20 bg-white/50 text-teal-700 hover:text-teal-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
            aria-label="Editar repuesto"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(repuesto.id)}
            className="p-2 border border-red-500/20 bg-white/50 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
            aria-label="Eliminar repuesto"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
