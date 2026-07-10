import { Check, X } from 'lucide-react';
import type { UsuarioPermiso } from '@/types/usuario';

interface PermisoRowProps {
  permiso: UsuarioPermiso;
}

export function PermisoRow({ permiso }: PermisoRowProps) {
  const labelId = `permiso-label-${permiso.id}`;
  const statusId = `permiso-status-${permiso.id}`;
  const statusText = permiso.activo ? 'Permitido' : 'No permitido';

  return (
    <li
      className="flex items-center justify-between gap-4 rounded-xl bg-[#EBE2D5] border border-[#DED4C7]/70 px-4 py-3.5 sm:px-5"
      aria-labelledby={`${labelId} ${statusId}`}
    >
      <span id={labelId} className="text-sm sm:text-base font-medium text-gray-800">
        {permiso.nombre}
      </span>
      <span
        id={statusId}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
          permiso.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}
        role="img"
        aria-label={`${permiso.nombre}: ${statusText}`}
      >
        {permiso.activo ? (
          <Check size={18} strokeWidth={2.5} aria-hidden />
        ) : (
          <X size={18} strokeWidth={2.5} aria-hidden />
        )}
      </span>
    </li>
  );
}
