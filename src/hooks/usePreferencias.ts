'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getPreferencias, updatePreferencias } from '@/services/preferencias';
import type { Preferencia, TemaPreferencia } from '@/types/preferencia';

export function usePreferencias() {
  const [preferencia, setPreferencia] = useState<Preferencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferencias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPreferencia(await getPreferencias());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las preferencias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPreferencias(); }, [fetchPreferencias]);

  const cambiarTema = useCallback(async (tema: TemaPreferencia) => {
    const current = preferencia || { id: '', empresa_id: '', tema: 'oscuro', version: 1 };
    try {
      setError(null);
      const actualizada = await updatePreferencias(current, { tema, version: current.version });
      setPreferencia(actualizada);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar el tema.');
    }
  }, [preferencia]);

  return { preferencia, loading, error, cambiarTema, refetch: fetchPreferencias };
}