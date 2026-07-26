'use client';

import { useCallback, useEffect, useState } from 'react';
import { getEmpresa, updateEmpresa } from '@/services/empresa';
import type { ActualizarEmpresaInput, Empresa } from '@/types/empresa';

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const fetchEmpresa = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmpresa();
      setEmpresa(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empresa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEmpresa();
  }, [fetchEmpresa]);

  const guardarEmpresa = useCallback(
    async (input: ActualizarEmpresaInput) => {
      setSaving(true);
      setSaveError(null);
      setSaveOk(false);
      try {
        const updated = await updateEmpresa(input);
        setEmpresa(updated);
        setSaveOk(true);
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al guardar';
        if (msg.includes('ERR_STALE_DATA') || msg.includes('409')) {
          setSaveError('recargar');
        } else {
          setSaveError(msg);
        }
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    empresa,
    loading,
    error,
    saving,
    saveError,
    saveOk,
    refetch: fetchEmpresa,
    guardarEmpresa,
  };
}
