'use client';

import React from 'react';
import { Shield, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';

interface Usuario {
  id: number;
  initials: string;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  estado: string;
}

const mockUsuarios: Usuario[] = [
  {
    id: 1,
    initials: 'CT',
    nombre: 'Cesar Torres',
    email: 'cesartorres@gmail.com',
    rol: 'Administrador',
    departamento: 'Infraestructura',
    estado: 'Activo',
  },
  {
    id: 2,
    initials: 'JM',
    nombre: 'Juan Mora',
    email: 'juanmora@gmail.com',
    rol: 'Técnico',
    departamento: 'Laboratorios',
    estado: 'Activo',
  },
  {
    id: 3,
    initials: 'CT',
    nombre: 'Cesar Torres',
    email: 'cesartorres@gmail.com',
    rol: 'Administrador',
    departamento: 'Infraestructura',
    estado: 'Activo',
  },
  {
    id: 4,
    initials: 'CT',
    nombre: 'Cesar Torres',
    email: 'cesartorres@gmail.com',
    rol: 'Administrador',
    departamento: 'Infraestructura',
    estado: 'Activo',
  },
];

export default function GestionUsuariosPage() {
  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <PageHeader
        title="Configuración / Usuarios"
        searchLabel="Buscar usuarios"
      />

      <ConfigBackLink />

      {/* Main Container */}
      <div className="bg-[#F7F4EF] rounded-[2rem] p-8 shadow-sm border border-[#EBE2D5]">
        {/* Container Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Gestión de usuarios
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Administración de permisos y personal
            </p>
          </div>
          <button className="bg-[#E5A93D] hover:bg-[#d19730] text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm">
            + Nuevo usuario
          </button>
        </div>

        {/* Custom Table Head */}
        <div className="bg-[#EED586] rounded-xl px-6 py-3.5 mb-4 grid grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider items-center shadow-sm">
          <div className="col-span-4">Usuario</div>
          <div className="col-span-3">Rol/Cargo</div>
          <div className="col-span-2">Departamento</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-2 text-right font-bold">Acción</div>
        </div>

        {/* User Rows */}
        <div className="space-y-3">
          {mockUsuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-[#EBE2D5] rounded-xl px-6 py-4 grid grid-cols-12 gap-4 items-center shadow-sm border border-[#DED4C7]/50 hover:shadow-md transition-shadow"
            >
              {/* Usuario column */}
              <Link
                href={`/configuracion/usuarios/${usuario.id}`}
                className="col-span-4 flex items-center space-x-4 hover:opacity-80 transition-opacity"
              >
                <div className="bg-[#EED586] text-gray-800 font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {usuario.initials}
                </div>
                <div className="truncate">
                  <div className="font-bold text-gray-800 text-base leading-tight">
                    {usuario.nombre}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                    {usuario.email}
                  </div>
                </div>
              </Link>

              {/* Rol column */}
              <div className="col-span-3 flex items-center space-x-2 text-gray-700">
                <Shield size={16} className="text-gray-600 flex-shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium">{usuario.rol}</span>
              </div>

              {/* Departamento column */}
              <div className="col-span-2">
                <span className="inline-block bg-[#C3B9AA] text-gray-800 rounded-md px-3 py-1 text-xs font-semibold">
                  {usuario.departamento}
                </span>
              </div>

              {/* Estado column */}
              <div className="col-span-1">
                <span className="inline-block bg-[#E5A93D] text-black rounded-md px-3 py-1 text-xs font-bold">
                  {usuario.estado}
                </span>
              </div>

              {/* Acción column */}
              <div className="col-span-2 flex justify-end items-center space-x-2">
                <button className="p-2 border border-teal-600/20 bg-white/50 text-teal-700 hover:text-teal-900 hover:bg-white rounded-lg transition-colors cursor-pointer" aria-label="Editar usuario">
                  <Pencil size={16} strokeWidth={2} />
                </button>
                <button className="p-2 border border-red-500/20 bg-white/50 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition-colors cursor-pointer" aria-label="Eliminar usuario">
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
