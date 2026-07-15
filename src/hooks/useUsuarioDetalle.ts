'use client';

import { useCallback, useEffect, useState } from 'react';
import { deleteUsuario, getUsuarioById, updateUsuario } from '@/services/usuarios';
import type { UsuarioDetalle } from '@/types/usuario';

function toDetalle(u: { id: string; nombre: string; email: string; telefono: string | null; activo: boolean; roles: string[]; created_at: string; updated_at: string }): UsuarioDetalle {
  const parts = u.nombre.trim().split(/\s+/).filter(Boolean);
  const iniciales = parts.length === 0 ? 'U' : parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return {
    id: u.id,
    iniciales,
    nombre: u.nombre,
    codigo: u.id.slice(0, 8).toUpperCase(),
    sede: '—',
    email: u.email,
    rol: u.roles.join(', ') || '—',
    rolSlug: (u.roles[0] || '').toLowerCase(),
    cargo: u.roles.join(', ') || '—',
    fechaIngreso: u.created_at ? new Date(u.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    ultimoAcceso: u.updated_at ? new Date(u.updated_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
    permisos: [],
  };
}

export function useUsuarioDetalle(id: string) {
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await getUsuarioById(id);
      setUsuario(toDetalle(u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle del usuario.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchUsuario(); }, [fetchUsuario]);

  const refetch = useCallback(() => fetchUsuario(), [fetchUsuario]);

  const actualizarUsuario = useCallback(
    async (input: { nombre: string; email: string; rol: string; estado: string; cargo?: string }) => {
      const u = await updateUsuario(id, {
        nombre: input.nombre,
        email: input.email,
      });
      setUsuario(toDetalle(u));
    },
    [id],
  );

  const eliminarUsuario = useCallback(async () => {
    await deleteUsuario(id);
  }, [id]);

  return { usuario, loading, error, refetch, actualizarUsuario, eliminarUsuario };
}
