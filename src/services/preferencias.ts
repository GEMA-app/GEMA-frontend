import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResource, getAttr, getAttrNumber } from '@/lib/jsonapi';
import type { ActualizarPreferenciaInput, Preferencia, TemaPreferencia } from '@/types/preferencia';

const TEMAS: TemaPreferencia[] = ['oscuro', 'claro', 'sistema'];

function mapPreferencia(payload: unknown): Preferencia {
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudieron interpretar las preferencias.');
  const rawTema = getAttr(resource, 'tema', 'oscuro') as TemaPreferencia;
  return {
    id: resource.id,
    empresa_id: getAttr(resource, 'empresa_id'),
    tema: TEMAS.includes(rawTema) ? rawTema : 'oscuro',
    version: getAttrNumber(resource, 'version', 1),
  };
}

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/yo/preferencias`;
}

export async function getPreferencias(): Promise<Preferencia> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url);
  return mapPreferencia(payload);
}

export async function updatePreferencias(
  actual: Preferencia,
  input: ActualizarPreferenciaInput,
): Promise<Preferencia> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'preferences',
        id: actual.id,
        attributes: { tema: input.tema, version: input.version },
      },
    },
  });
  return mapPreferencia(payload);
}