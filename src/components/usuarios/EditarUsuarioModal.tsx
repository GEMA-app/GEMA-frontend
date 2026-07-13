'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getRoles } from '@/services/usuarios';
import type { DropdownOption } from '@/types/repuesto';
import type { ActualizarUsuarioInput, UsuarioDetalle } from '@/types/usuario';

interface EditarUsuarioModalProps {
  isOpen: boolean;
  usuario: UsuarioDetalle | null;
  onClose: () => void;
  onSave: (input: ActualizarUsuarioInput) => Promise<void>;
  saving?: boolean;
}

export function EditarUsuarioModal({
  isOpen,
  usuario,
  onClose,
  onSave,
  saving = false,
}: EditarUsuarioModalProps) {
  const [roles, setRoles] = useState<DropdownOption[]>([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rolId, setRolId] = useState('');
  const [cargo, setCargo] = useState('');
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (!isOpen || !usuario) return;

    setNombre(usuario.nombre);
    setEmail(usuario.email);
    setCargo(usuario.cargo);
    setError(null);

    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const data = await getRoles();
        setRoles(data);
        const match = data.find((r) => r.nombre.toLowerCase() === usuario.rol.trim().toLowerCase());
        setRolId(match?.id ?? data[0]?.id ?? '');
      } catch {
        setError('No se pudieron cargar los roles.');
      } finally {
        setLoadingRoles(false);
      }
    };

    void fetchRoles();
  }, [isOpen, usuario]);

  if (!isOpen || !usuario) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await onSave({
        nombre,
        email,
        rol: rolId,
        activo,
        cargo,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo actualizar el usuario.';
      setError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editar-usuario-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#DED4C7] bg-[#F7F4EF] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EBE2D5] px-6 py-4">
          <h2 id="editar-usuario-title" className="text-xl font-bold text-gray-800">
            Modificar perfil de usuario
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-white/70 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="editar-nombre" className="mb-1 block text-sm font-semibold text-gray-700">
              Nombre
            </label>
            <input
              id="editar-nombre"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div>
            <label htmlFor="editar-email" className="mb-1 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              id="editar-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div>
            <label htmlFor="editar-rol" className="mb-1 block text-sm font-semibold text-gray-700">
              Rol
            </label>
            <select
              id="editar-rol"
              value={rolId}
              onChange={(event) => setRolId(event.target.value)}
              required
              disabled={loadingRoles}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] disabled:opacity-60"
            >
              <option value="">
                {loadingRoles ? 'Cargando…' : 'Seleccionar rol'}
              </option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="editar-cargo" className="mb-1 block text-sm font-semibold text-gray-700">
              Cargo
            </label>
            <input
              id="editar-cargo"
              type="text"
              value={cargo}
              onChange={(event) => setCargo(event.target.value)}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-[#DED4C7] bg-white px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={activo}
              onChange={(event) => setActivo(event.target.checked)}
              className="h-4 w-4 accent-[#E5A93D]"
            />
            <span className="text-sm font-semibold text-gray-700">Usuario activo</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#DED4C7] bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || loadingRoles}
              className="rounded-xl bg-[#E5A93D] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d19730] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
