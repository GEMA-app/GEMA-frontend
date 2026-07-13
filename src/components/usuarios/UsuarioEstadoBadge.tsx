interface UsuarioEstadoBadgeProps {
  estado: string;
}

function normalizeEstado(estado: string): string {
  return estado.trim().toLowerCase();
}

export function UsuarioEstadoBadge({ estado }: UsuarioEstadoBadgeProps) {
  const normalized = normalizeEstado(estado);

  const className =
    normalized === 'activo'
      ? 'bg-[#E5A93D] text-black'
      : normalized === 'suspendido'
        ? 'bg-red-100 text-red-800'
        : 'bg-[#C3B9AA] text-gray-800';

  return (
    <span
      className={`inline-block rounded-md px-3 py-1 text-xs font-bold ${className}`}
    >
      {estado}
    </span>
  );
}
