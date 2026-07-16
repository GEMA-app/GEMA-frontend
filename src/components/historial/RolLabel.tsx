import type { RolUsuario } from '@/types/historial';

const ROL_STYLES: Record<string, string> = {
  Administrador: 'text-[#C62828]',
  Supervisor: 'text-[#E65100]',
  Técnico: 'text-[#2E7D32]',
};

interface RolLabelProps {
  rol: RolUsuario;
}

export function RolLabel({ rol }: RolLabelProps) {
  return (
    <span className={`text-sm font-semibold ${ROL_STYLES[rol] ?? 'text-gray-600'}`}>
      {rol}
    </span>
  );
}
