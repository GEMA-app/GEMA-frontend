'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Users, Hammer, Globe, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ConfiguracionPage() {
  const cards = [
    {
      title: 'Historial de usuarios',
      description: 'Registros de actividad',
      icon: Clock,
      href: '/configuracion/historial',
    },
    {
      title: 'Gestión de usuarios',
      description: 'Administrar accesos, rol y permisos del personal',
      icon: Users,
      href: '/configuracion/usuarios',
    },
    {
      title: 'Empresa',
      description: 'Perfil y datos de la empresa',
      icon: Building2,
      href: '/configuracion/empresa',
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
      href: '/configuracion/ubicaciones',
    },
  ];

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <PageHeader
        title="Configuración"
        searchLabel="Buscar en configuración"
        className="mb-12"
      />

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
