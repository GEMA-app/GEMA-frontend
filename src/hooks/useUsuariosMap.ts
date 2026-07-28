'use client';

import { useEffect, useState } from 'react';
import { getUsuariosBasicos } from '@/services/usuarios';

/**
 * Carga todos los usuarios de la empresa y devuelve un mapa id → nombre.
 * Útil para resolver IDs de supervisor/técnico a nombres legibles.
 */
export function useUsuariosMap() {
  const [usuariosMap, setUsuariosMap] = useState<Map<string, string>>(new Map());
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Pedimos hasta 200 usuarios para cubrir el listado completo
        const { usuarios } = await getUsuariosBasicos({ perPage: 200 });
        if (cancelled) return;
        const map = new Map<string, string>();
        for (const u of usuarios) {
          map.set(u.id, u.nombre);
        }
        setUsuariosMap(map);
      } catch {
        // Si falla, dejamos el mapa vacío; los IDs se mostrarán como fallback
      } finally {
        if (!cancelled) setLoadingUsuarios(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /** Devuelve el nombre del usuario o el propio ID si no se encontró. */
  function resolveNombre(id: string | null | undefined): string {
    if (!id) return '—';
    return usuariosMap.get(id) ?? id;
  }

  return { usuariosMap, loadingUsuarios, resolveNombre };
}
