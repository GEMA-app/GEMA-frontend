import { fetchWithAuth } from '@/lib/api';

export interface UserPreferences {
  usuario_id: string;
  empresa_id: string;
  tema: string;
  version: number;
}

export async function getPreferences(): Promise<UserPreferences> {
  const empresaId = localStorage.getItem('empresa_id');
  if (!empresaId) throw new Error('No hay sesión activa.');

  const payload: any = await fetchWithAuth(`/v1/empresas/${empresaId}/yo/preferencias`);
  const d = payload?.data;
  return {
    usuario_id: d.id,
    empresa_id: d.attributes.empresa_id,
    tema: d.attributes.tema,
    version: d.attributes.version,
  };
}

export async function updatePreferences(tema: string, version: number): Promise<UserPreferences> {
  const empresaId = localStorage.getItem('empresa_id');
  const userId = localStorage.getItem('user_id');
  if (!empresaId) throw new Error('No hay sesión activa.');

  const payload: any = await fetchWithAuth(`/v1/empresas/${empresaId}/yo/preferencias`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'preferences',
        id: userId,
        attributes: { tema, version },
      },
    },
  });

  const d = payload?.data;
  return {
    usuario_id: d.id,
    empresa_id: d.attributes.empresa_id,
    tema: d.attributes.tema,
    version: d.attributes.version,
  };
}
