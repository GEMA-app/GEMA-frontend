'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, User, Clock, Users, Hammer, Globe } from 'lucide-react';

export default function ConfiguracionPage() {
  const cards = [
    {
      title: 'Historial de usuarios',
      description: 'Registros de actividad',
      icon: Clock,
      href: '#',
    },
    {
      title: 'Gestión de usuarios',
      description: 'Administrar accesos, rol y permisos del personal',
      icon: Users,
      href: '/configuracion/usuarios',
    },
    {
      title: 'Gestión de repuestos',
      description: 'Administrar materiales y herramientas',
      icon: Hammer,
      href: '/configuracion/repuestos',
    },
    {
      title: 'Ubicaciones',
      description: 'Gestionar ubicaciones',
      icon: Globe,
      href: '#',
    },
  ];

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 font-sans tracking-tight">
          Configuración
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar" 
              className="pl-10 pr-4 py-2 bg-[#F8F6F4] border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-[#ECA03C] outline-none text-gray-700"
            />
          </div>
          <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm bg-white cursor-pointer transition-colors">
            <Bell className="w-6 h-6 text-[#8B5E3C]" strokeWidth={1.5} />
          </button>
          <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm bg-white cursor-pointer transition-colors">
            <User className="w-6 h-6 text-[#8B5E3C]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} href={card.href} className="block">
              <div
                className="bg-[#EBE2D5] rounded-3xl border border-[#DED4C7] p-8 flex flex-col justify-between h-56 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div>
                  <Icon size={32} className="text-[#8B5E3C]" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {card.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
