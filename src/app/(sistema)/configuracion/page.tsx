'use client';

import Link from 'next/link';
import { Clock, Users, Hammer, Globe, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

type ConfigCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

const CARDS: ConfigCard[] = [
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

export default function ConfiguracionPage() {
  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader
        title="Configuración"
        searchLabel="Buscar en configuración"
        className="mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const isDisabled = card.href === '#';

          const cardContent = (
            <div className="bg-[#EBE2D5] rounded-3xl border border-[#DED4C7] p-8 flex flex-col justify-between h-56 hover:shadow-md transition-all duration-300 cursor-pointer">
              <div>
                <Icon size={32} className="text-[#8B5E3C]" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
              </div>
            </div>
          );

          if (isDisabled) {
            return (
              <div
                key={card.title}
                className="opacity-70 cursor-not-allowed"
                aria-disabled="true"
                title="Próximamente"
              >
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={card.title}
              href={card.href}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ECA03C] rounded-3xl"
              aria-label={`${card.title}: ${card.description}`}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
