'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, User, ArrowLeft, FileText, MapPin, Calendar } from 'lucide-react';

const activo = {
  nombre: 'SERVIDOR X',
  id: '12345',
  categoria: 'Servidor',
  codigo: 'ACT-12345',
  marca: 'Dell',
  ubicacion: 'Sala de servidores',
  responsable: 'Ingeniería de sistemas',
  fechaCompra: '05/07/2024',
  garantiaHasta: '08/12/2025',
  detalles:
    'Servidor principal para el sistema de control. Configuración con 24GB RAM, 2TB SSD y sistema de refrigeración redundante. Se utiliza para aplicaciones críticas de la planta.',
  estadoInicial: 'Para Revisión',
  ultimoMantenimiento: '08/12/2025',
};

export default function FichaDeActivoPage() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestión de activos</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar activo..."
              className="pl-10 pr-4 py-2.5 rounded-xl text-sm w-64 outline-none border border-transparent focus:border-[#E59D12] transition-colors"
              style={{ backgroundColor: 'rgba(46, 67, 101, 0.05)' }}
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="mb-6">
        <Link href="/activos" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
        <div className="flex flex-col gap-3 border-b border-[#2E4365]/20 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activo.nombre}</h2>
              <p className="text-xs uppercase tracking-[0.18em] text-[#2E4365] font-semibold mt-2">ID ACTIVO: {activo.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                <FileText className="w-4 h-4 text-[#E5920C]" />
                Información General
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nombre del Activo</p>
                  <p className="font-semibold">{activo.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Código Inventario</p>
                  <p className="font-semibold">{activo.codigo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Categoría</p>
                  <p className="font-semibold">{activo.categoria}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Marca / Fabricante</p>
                  <p className="font-semibold">{activo.marca}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                <MapPin className="w-4 h-4 text-[#E5920C]" />
                Ubicación y Adquisición
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ubicación Física</p>
                  <p className="font-semibold">{activo.ubicacion}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Responsable / Custodio</p>
                  <p className="font-semibold">{activo.responsable}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha de Compra</p>
                  <p className="font-semibold">{activo.fechaCompra}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Garantía Hasta</p>
                  <p className="font-semibold">{activo.garantiaHasta}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
              <FileText className="w-4 h-4 text-[#E5920C]" />
              Detalles Adicionales
            </div>
            <p className="text-sm text-gray-700 leading-7">{activo.detalles}</p>
            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>Fecha de adquisición: {activo.fechaCompra}</p>
              <p>Último mantenimiento: {activo.ultimoMantenimiento}</p>
            </div>
          </div>

          <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
            <h3 className="text-gray-800 font-bold text-base mb-5">Estado Inicial</h3>
            <div className="space-y-3">
              {['Operativo', 'En mantenimiento', 'Para Revisión'].map((estado) => (
                <div
                  key={estado}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    estado === activo.estadoInicial ? 'border-[#ECA03C]' : 'border-gray-200 bg-white'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${
                      estado === activo.estadoInicial ? 'bg-[#8B4513]' : 'bg-transparent border border-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-700">{estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
