'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Shield, Trash2 } from 'lucide-react';
import type { Usuario } from '@/types/usuario';
import { UsuarioEstadoBadge } from './UsuarioEstadoBadge';

interface UsuarioRowProps {
  usuario: Usuario;
  onDelete: (id: string) => void;
}

export function UsuarioRow({ usuario, onDelete }: UsuarioRowProps) {
  const router = useRouter();
  const detailHref = `/configuracion/usuarios/${usuario.id}`;

  const goToDetail = () => {
    router.push(detailHref);
  };

  return (
    <>
      <article
        className="md:hidden bg-[#EBE2D5] rounded-xl px-4 py-4 shadow-sm border border-[#DED4C7]/50 space-y-4"
        aria-label={`Usuario ${usuario.nombre}`}
      >
        <button
          type="button"
          onClick={goToDetail}
          className="w-full text-left cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="bg-[#EED586] text-gray-800 font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
              {usuario.iniciales}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-800 text-base leading-tight">{usuario.nombre}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{usuario.email}</p>
            </div>
            <UsuarioEstadoBadge estado={usuario.estado} />
          </div>
        </button>

        <dl className="grid grid-cols-1 gap-2 text-sm bg-white/40 rounded-xl p-3">
          <div className="flex justify-between items-center gap-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Rol/Cargo</dt>
            <dd className="flex items-center gap-1.5 text-gray-700 font-medium">
              <Shield size={14} className="text-gray-600 flex-shrink-0" aria-hidden />
              {usuario.rol}
            </dd>
          </div>
          <div className="flex justify-between items-center gap-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Departamento</dt>
            <dd>
              <span className="inline-block bg-[#C3B9AA] text-gray-800 rounded-md px-3 py-1 text-xs font-semibold">
                {usuario.departamento}
              </span>
            </dd>
          </div>
        </dl>

        <div className="flex justify-end items-center gap-2 pt-1 border-t border-[#DED4C7]/60">
          <Link
            href={detailHref}
            className="p-2 border border-[#8B5E3C]/20 bg-white/50 text-[#8B5E3C] hover:bg-white rounded-lg transition-colors"
            aria-label={`Ver ${usuario.nombre}`}
          >
            <Eye size={16} strokeWidth={2} />
          </Link>
          <Link
            href={detailHref}
            className="p-2 border border-teal-600/20 bg-white/50 text-teal-700 hover:bg-white rounded-lg transition-colors"
            aria-label={`Editar ${usuario.nombre}`}
          >
            <Pencil size={16} strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(usuario.id)}
            className="p-2 border border-red-500/20 bg-white/50 text-red-500 hover:bg-white rounded-lg transition-colors cursor-pointer"
            aria-label={`Eliminar ${usuario.nombre}`}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </article>

      <div
        role="button"
        tabIndex={0}
        onClick={goToDetail}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goToDetail();
          }
        }}
        className="hidden md:grid bg-[#EBE2D5] rounded-xl px-6 py-4 grid-cols-12 gap-4 items-center shadow-sm border border-[#DED4C7]/50 hover:shadow-md transition-shadow cursor-pointer"
        aria-label={`Ver detalle de ${usuario.nombre}`}
      >
        <div className="col-span-4 flex items-center space-x-4 min-w-0">
          <div className="bg-[#EED586] text-gray-800 font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
            {usuario.iniciales}
          </div>
          <div className="truncate">
            <div className="font-bold text-gray-800 text-base leading-tight">{usuario.nombre}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight truncate">{usuario.email}</div>
          </div>
        </div>

        <div className="col-span-3 flex items-center space-x-2 text-gray-700 min-w-0">
          <Shield size={16} className="text-gray-600 flex-shrink-0" strokeWidth={2} aria-hidden />
          <span className="text-sm font-medium truncate">{usuario.rol}</span>
        </div>

        <div className="col-span-2">
          <span className="inline-block bg-[#C3B9AA] text-gray-800 rounded-md px-3 py-1 text-xs font-semibold">
            {usuario.departamento}
          </span>
        </div>

        <div className="col-span-1">
          <UsuarioEstadoBadge estado={usuario.estado} />
        </div>

        <div
          className="col-span-2 flex justify-end items-center space-x-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Link
            href={detailHref}
            className="p-2 border border-[#8B5E3C]/20 bg-white/50 text-[#8B5E3C] hover:text-[#6d4a2f] hover:bg-white rounded-lg transition-colors"
            aria-label={`Ver ${usuario.nombre}`}
          >
            <Eye size={16} strokeWidth={2} />
          </Link>
          <Link
            href={detailHref}
            className="p-2 border border-teal-600/20 bg-white/50 text-teal-700 hover:text-teal-900 hover:bg-white rounded-lg transition-colors"
            aria-label={`Editar ${usuario.nombre}`}
          >
            <Pencil size={16} strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(usuario.id)}
            className="p-2 border border-red-500/20 bg-white/50 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
            aria-label={`Eliminar ${usuario.nombre}`}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
