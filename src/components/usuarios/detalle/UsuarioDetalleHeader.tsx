import type { UsuarioDetalle } from '@/types/usuario';

interface UsuarioDetalleHeaderProps {
  usuario: UsuarioDetalle;
}

export function UsuarioDetalleHeader({ usuario }: UsuarioDetalleHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-6 border-b border-[#DED4C7]">
      <div
        className="bg-[#EED586] text-gray-900 font-bold rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl"
        aria-hidden
      >
        {usuario.iniciales}
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wide uppercase truncate">
          {usuario.nombre}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
          ID: {usuario.codigo} - {usuario.sede}
        </p>
      </div>
    </header>
  );
}
