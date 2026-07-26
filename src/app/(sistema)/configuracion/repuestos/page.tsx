'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useRepuestos } from '@/hooks/useRepuestos';

export default function RepuestosPage() {
  const [query, setQuery] = useState('');
  const { repuestos, loading, error, eliminarRepuesto } = useRepuestos();

  const filtrados = repuestos.filter((r) =>
    r.articulo_id.toLowerCase().includes(query.toLowerCase()) ||
    r.ubicacion_almacen.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-screen overflow-y-auto bg-white p-8">
      <div className="mx-auto max-w-[1400px] space-y-6 pb-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-black">Configuración / Repuestos</h1>
            <p className="text-sm text-gray-600 mt-2">Control de stock, partes y consumibles</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="search-bar flex items-center gap-2 px-4 py-3 rounded-full shadow-sm min-w-[280px]">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-500 outline-none"
                placeholder="Buscar por artículo o ubicación"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="flex justify-between items-center">
          <Link href="/configuracion" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a configuración</span>
          </Link>
        </div>

        <main className="card-large overflow-hidden">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Gestión de repuestos</h2>
              <p className="text-sm text-gray-600 mt-1">Control de stock, partes y consumibles</p>
            </div>

            <Link href="/configuracion/agg_editar_repuesto" className="btn-nuevo-repuesto inline-flex items-center gap-2 shadow-sm transition hover:brightness-95">
              <Plus className="w-5 h-5" />
              <span>Nuevo repuesto</span>
            </Link>
          </div>

          <div className="table-header-box mb-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-700">
              <div className="text-left">ARTÍCULO ID</div>
              <div className="col-span-2 text-left">UBICACIÓN ALMACÉN</div>
              <div className="text-left">STOCK</div>
              <div className="text-left">STOCK MÍN.</div>
              <div className="text-left">ACCIONES</div>
            </div>
          </div>

          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando repuestos...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600 py-6">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            {!loading && !error && filtrados.length === 0 && (
              <div className="text-center py-12 text-gray-500">No hay repuestos registrados.</div>
            )}
            {filtrados.map((r) => (
              <div key={r.id} className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                <div className="grid grid-cols-6 gap-4 items-center text-sm">
                  <div className="text-gray-700 font-mono text-xs">{r.articulo_id}</div>
                  <div className="col-span-2 text-gray-900 font-semibold">{r.ubicacion_almacen}</div>
                  <div className={`text-lg font-semibold ${r.stock_actual <= r.stock_minimo ? 'text-red-600' : 'text-gray-900'}`}>
                    {r.stock_actual}
                  </div>
                  <div className="text-gray-500">{r.stock_minimo}</div>
                  <div className="flex items-center gap-3 justify-end">
                    <Link href={`/configuracion/repuestos/${r.id}`} aria-label="ver" className="grid place-items-center rounded-full border border-gray-200 p-2 text-[#2E4365] hover:bg-[#F2F7F3]">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/configuracion/repuestos/${r.id}/editar`} aria-label="editar" className="grid place-items-center rounded-full border border-gray-200 p-2 text-[#0A8E71] hover:bg-[#F2F7F3]">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      aria-label="eliminar"
                      onClick={() => void eliminarRepuesto(r.id)}
                      className="grid place-items-center rounded-full border border-gray-200 p-2 text-[#FF0000] hover:bg-[#FDECEF]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
