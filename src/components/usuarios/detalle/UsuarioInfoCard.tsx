import { Building2, Mail, UserRound } from 'lucide-react';
import type { UsuarioDetalle } from '@/types/usuario';

interface UsuarioInfoCardProps {
  usuario: UsuarioDetalle;
}

export function UsuarioInfoCard({ usuario }: UsuarioInfoCardProps) {
  const items = [
    { icon: Mail, label: usuario.email },
    { icon: Building2, label: usuario.rol },
    { icon: UserRound, label: usuario.cargo },
  ];

  return (
    <section className="rounded-2xl border border-[#DED4C7] bg-[#EBE2D5]/60 p-5 sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
        Información general
      </h2>
      <ul className="space-y-2 sm:space-y-3" role="list" aria-label="Lista de permisos">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex items-center gap-3 text-gray-800">
              <Icon size={18} className="text-[#8B5E3C] flex-shrink-0" aria-hidden />
              <span className="text-sm sm:text-base font-medium">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
