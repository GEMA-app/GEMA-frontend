import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResource, getAttr, getAttrNumber } from '@/lib/jsonapi';
import type { ActualizarEmpresaInput, Empresa, EstadoEmpresa } from '@/types/empresa';

const ESTADOS: EstadoEmpresa[] = ['activa', 'suspendida', 'cancelada'];

function mapEmpresa(payload: unknown): Empresa {
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar la empresa.');
  const rawEstado = getAttr(resource, 'estado', 'activa') as EstadoEmpresa;
  return {
    id: resource.id,
    nombre: getAttr(resource, 'nombre'),
    slug: getAttr(resource, 'slug'),
    estado: ESTADOS.includes(rawEstado) ? rawEstado : 'activa',
    rif: getAttr(resource, 'rif') || null,
    email_contacto: getAttr(resource, 'email_contacto') || null,
    plan_id: getAttr(resource, 'plan_id') || null,
    trial_hasta: getAttr(resource, 'trial_hasta') || null,
    version: getAttrNumber(resource, 'version', 1),
  };
}

export async function getEmpresa(): Promise<Empresa> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}`);
  return mapEmpresa(payload);
}

export async function updateEmpresa(input: ActualizarEmpresaInput): Promise<Empresa> {
  const empresaId = await requireEmpresaId();
  const { version, ...rest } = input;
  const attributes: Record<string, unknown> = { version };
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) attributes[key] = value;
  }
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'companies', attributes } },
  });
  return mapEmpresa(payload);
}