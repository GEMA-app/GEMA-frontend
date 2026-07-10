'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { NuevoUsuarioInput, UsuarioEstado } from '@/types/usuario';

interface NuevoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: NuevoUsuarioInput) => Promise<void>;
  saving?: boolean;
}

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'reporter', label: 'Reporter' },
];

const ESTADOS: UsuarioEstado[] = ['activo', 'inactivo', 'suspendido'];

export function NuevoUsuarioModal({
  isOpen,
  onClose,
  onSave,
  saving = false,
}: NuevoUsuarioModalProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('admin');
  const [estado, setEstado] = useState<UsuarioEstado>('activo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setNombre('');
    setEmail('');
    setRol('admin');
    setEstado('activo');
    setError(null);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await onSave({ nombre, email, rol, estado });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el usuario.';
      setError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuevo-usuario-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#DED4C7] bg-[#F7F4EF] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EBE2D5] px-6 py-4">
          <h2 id="nuevo-usuario-title" className="text-xl font-bold text-gray-800">
            Nuevo usuario
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
            <label htmlFor="usuario-nombre" className="mb-1 block text-sm font-semibold text-gray-700">
              Nombre
            </label>
            <input
              id="usuario-nombre"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div>
            <label htmlFor="usuario-email" className="mb-1 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              id="usuario-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div>
            <label htmlFor="usuario-rol" className="mb-1 block text-sm font-semibold text-gray-700">
              Rol
            </label>
            <select
              id="usuario-rol"
              value={rol}
              onChange={(event) => setRol(event.target.value)}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            >
              {ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="usuario-estado" className="mb-1 block text-sm font-semibold text-gray-700">
              Estado
            </label>
            <select
              id="usuario-estado"
              value={estado}
              onChange={(event) => setEstado(event.target.value as UsuarioEstado)}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            >
              {ESTADOS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

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
              disabled={saving}
              className="rounded-xl bg-[#E5A93D] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d19730] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
