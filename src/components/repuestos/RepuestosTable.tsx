'use client';

import { Plus, Search } from 'lucide-react';
import { useRef } from 'react';
import { RepuestoRow } from './RepuestoRow';
import type { Repuesto } from '@/types/repuesto';

interface RepuestosTableProps {
  repuestos: Repuesto[];
  loading: boolean;
  error: string | null;
  empty: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
  onEdit: (repuesto: Repuesto) => void;
  onDelete: (id: string) => void;
}

export function RepuestosTable({
  repuestos,
  loading,
  error,
  empty,
  searchQuery,
  onSearchChange,
  onNew,
  onEdit,
  onDelete,
}: RepuestosTableProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-4" aria-label="Listado de repuestos">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Repuestos</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar repuesto..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#EBE2D5] border border-[#DED4C7] rounded-xl text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30"
            />
          </div>

          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-xl hover:bg-teal-800 transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            Nuevo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#DED4C7] border-t-[#8B5E3C]" role="status">
            <span className="sr-only">Cargando repuestos...</span>
          </div>
        </div>
      )}

      {empty && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <p className="font-semibold text-lg text-gray-700">No hay repuestos registrados</p>
          <p className="text-sm mt-1">Agregá el primer repuesto usando el botón &quot;Nuevo&quot;.</p>
        </div>
      )}

      {!loading && repuestos.length > 0 && (
        <div className="space-y-3" role="list">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
            <div className="col-span-3">Artículo</div>
            <div className="col-span-2">Ubicación</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Precio</div>
            <div className="col-span-3" />
          </div>

          {repuestos.map((repuesto) => (
            <div role="listitem" key={repuesto.id}>
              <RepuestoRow
                repuesto={repuesto}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
