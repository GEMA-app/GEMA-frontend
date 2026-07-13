const ROL_STYLES: Record<string, string> = {
  Administrador: 'text-[#C62828]',
  'Supervisor de Activos': 'text-[#BF360C]',
  'Supervisor de Operaciones': 'text-[#E65100]',
  Supervisor: 'text-[#E65100]',
  'Técnico de Mantenimiento': 'text-[#1B5E20]',
  Técnico: 'text-[#1B5E20]',
  Almacenista: 'text-[#1565C0]',
  Consultor: 'text-[#6A1B9A]',
};

const DEFAULT_STYLE = 'text-gray-700';

interface RolLabelProps {
  rol: string;
}

export function RolLabel({ rol }: RolLabelProps) {
  const style = ROL_STYLES[rol] ?? DEFAULT_STYLE;
  return (
    <span className={`text-sm font-semibold ${style}`}>
      {rol}
    </span>
  );
}
