interface UsuarioDetalleActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export function UsuarioDetalleActions({
  onEdit,
  onDelete,
  deleting = false,
}: UsuarioDetalleActionsProps) {
  return (
    <div className="flex flex-col items-stretch sm:items-center gap-4 pt-2">
      <button
        type="button"
        onClick={onEdit}
        className="w-full sm:w-auto bg-[#E5A93D] hover:bg-[#d19730] text-black font-bold px-6 py-3.5 rounded-xl shadow-sm transition-colors cursor-pointer text-sm tracking-wide uppercase"
      >
        Modificar perfil de usuario
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="text-red-600 hover:text-red-800 text-sm font-semibold underline underline-offset-4 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {deleting ? 'Eliminando…' : 'Eliminar usuario'}
      </button>
    </div>
  );
}
