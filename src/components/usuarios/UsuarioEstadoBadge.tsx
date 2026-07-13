interface UsuarioEstadoBadgeProps {
  activo: boolean;
}

export function UsuarioEstadoBadge({ activo }: UsuarioEstadoBadgeProps) {
  const label = activo ? 'Activo' : 'Inactivo';
  const className = activo ? 'bg-[#E5A93D] text-black' : 'bg-[#C3B9AA] text-gray-800';

  return (
    <span
      className={`inline-block rounded-md px-3 py-1 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}
