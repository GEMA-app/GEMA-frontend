'use client';

import Link from 'next/link';
import React from 'react';
import { Search, Plus, Pencil, Trash2, Bell, User, ArrowLeft } from 'lucide-react';

interface Repuesto {
  id: string;
  codigo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  stock: number;
}

const MOCK: Repuesto[] = [
  {
    id: '1',
    codigo: 'LC-001',
    descripcion: 'Memoria RAM\n16GB DDR4',
    categoria: 'Cómputo',
    ubicacion: 'Almacén',
    stock: 15,
  },
  {
    id: '2',
    codigo: 'LC-002',
    descripcion: 'Disco SSD 500GB',
    categoria: 'Cómputo',
    ubicacion: 'Almacén',
    stock: 8,
  },
  {
    id: '3',
    codigo: 'LC-003',
    descripcion: 'Fuente 500W',
    categoria: 'Eléctrico',
    ubicacion: 'Almacén',
    stock: 5,
  },
];

export default function RepuestosPage() {
  return (
    <div className="h-screen overflow-y-auto bg-white p-8">
      <div className="mx-auto max-w-[1400px] space-y-6 pb-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold">Configuración / Repuestos</h1>
            <p className="text-sm text-gray-600 mt-2">Control de stock, partes y consumibles</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="search-bar flex items-center gap-2 px-4 py-3 rounded-full shadow-sm min-w-[280px]">
              <Search className="w-5 h-5 text-gray-600" />
              <input
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-500 outline-none"
                placeholder="Buscar"
              />
            </div>

            <button aria-label="notificaciones" className="grid place-items-center rounded-2xl bg-white p-3 shadow-sm hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>

            <button aria-label="usuario" className="grid place-items-center rounded-2xl bg-white p-3 shadow-sm hover:bg-gray-100">
              <User className="w-5 h-5 text-gray-700" />
            </button>
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
              <h2 className="text-2xl font-bold">Gestión de repuestos</h2>
              <p className="text-sm text-gray-600 mt-1">Control de stock, partes y consumibles</p>
            </div>

            <button className="btn-nuevo-repuesto inline-flex items-center gap-2 shadow-sm transition hover:brightness-95">
              <Plus className="w-5 h-5" />
              <span>Nuevo repuesto</span>
            </button>
          </div>

          <div className="table-header-box mb-4">
            <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-gray-700">
              <div className="text-left">CÓDIGO</div>
              <div className="col-span-2 text-left">DESCRIPCIÓN</div>
              <div className="text-left">CATEGORÍA</div>
              <div className="text-left">UBICACIÓN</div>
              <div className="text-left">STOCK</div>
              <div className="text-left">ACCIONES</div>
            </div>
          </div>

          <div className="space-y-3">
            {MOCK.map((r) => (
              <div key={r.id} className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                <div className="grid grid-cols-7 gap-4 items-center text-sm">
                  <div className="text-gray-700">{r.codigo}</div>
                  <div className="col-span-2 text-gray-900 whitespace-pre-line font-semibold">{r.descripcion}</div>
                  <div>
                    <span className="badge-categoria">{r.categoria}</span>
                  </div>
                  <div className="text-gray-700">{r.ubicacion}</div>
                  <div className="text-lg font-semibold text-gray-900">{r.stock}</div>
                  <div className="flex items-center gap-3 justify-end">
                    <button aria-label="editar" className="grid place-items-center rounded-full border border-gray-200 p-2 text-[#0A8E71] hover:bg-[#F2F7F3]">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button aria-label="eliminar" className="grid place-items-center rounded-full border border-gray-200 p-2 text-[#FF0000] hover:bg-[#FDECEF]">
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
