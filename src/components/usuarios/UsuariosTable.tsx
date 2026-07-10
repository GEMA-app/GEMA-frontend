import type { Usuario } from '@/types/usuario';
import { UsuarioRow } from './UsuarioRow';

interface UsuariosTableProps {
  usuarios: Usuario[];
  onDelete: (id: string) => void;
}

export function UsuariosTable({ usuarios, onDelete }: UsuariosTableProps) {
  if (usuarios.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#DED4C7] bg-white/50 px-6 py-12 text-center text-gray-500 text-sm">
        No se encontraron usuarios.
      </div>
    );
  }

  return (
    <div role="region" aria-label="Lista de usuarios">
      <div
        className="hidden md:grid bg-[#EED586] rounded-xl px-6 py-3.5 mb-4 grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider items-center shadow-sm"
        aria-hidden
      >
        <div className="col-span-4">Usuario</div>
        <div className="col-span-3">Rol/Cargo</div>
        <div className="col-span-2">Departamento</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-2 text-right">Acción</div>
      </div>

      <div className="space-y-3">
        {usuarios.map((usuario) => (
          <UsuarioRow key={usuario.id} usuario={usuario} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
