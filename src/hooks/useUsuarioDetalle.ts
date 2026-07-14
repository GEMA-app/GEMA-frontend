'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getMockUsuarioDetalle } from '@/data/mockUsuariosDetalle';
import { buildPermisosFromRol } from '@/lib/permisos';
import { formatRol } from '@/lib/usuarios';
import {
  deleteUsuario,
  getUsuarioById,
  updateUsuario,
} from '@/services/usuarios';
import type { ActualizarUsuarioInput, UsuarioDetalle } from '@/types/usuario';

const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_USUARIOS === 'true';

export function useUsuarioDetalle(id: string) {
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(USE_MOCK);

  const fetchUsuario = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        const mock = getMockUsuarioDetalle(id);
        if (!mock) {
          setUsuario(null);
          setError('Usuario no encontrado.');
        } else {
          setUsuario(mock);
        }
        setIsMock(true);
        return;
      }

      const detalle = await getUsuarioById(id);
      setUsuario(detalle);
      setIsMock(false);
    } catch (err) {
      const mock = getMockUsuarioDetalle(id);
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo cargar el detalle del usuario.';

      if (mock) {
        setUsuario(mock);
        setIsMock(true);
        setError(message);
      } else {
        setUsuario(null);
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchUsuario();
  }, [fetchUsuario]);

  const refetch = useCallback(async () => {
    await fetchUsuario();
  }, [fetchUsuario]);

  const actualizarUsuario = useCallback(
    async (input: ActualizarUsuarioInput) => {
      if (isMock) {
        setUsuario((current) => {
          if (!current) {
            return current;
          }
          const rolSlug = input.rol.toLowerCase();
          return {
            ...current,
            nombre: input.nombre.toUpperCase(),
            email: input.email,
            rol: formatRol(rolSlug).toUpperCase(),
            rolSlug,
            cargo: input.cargo ?? current.cargo,
            permisos: buildPermisosFromRol(rolSlug),
          };
        });
        return;
      }

      const detalle = await updateUsuario(id, input);
      setUsuario(detalle);
    },
    [id, isMock],
  );

  const eliminarUsuario = useCallback(async () => {
    if (!isMock) {
      await deleteUsuario(id);
    }
  }, [id, isMock]);

  return {
    usuario,
    loading,
    error,
    isMock,
    refetch,
    actualizarUsuario,
    eliminarUsuario,
  };
}
