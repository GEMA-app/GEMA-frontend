import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import {
  extractRolesFromResponse,
  extractRolFromResponse,
  permisosToStrings,
} from '@/lib/roles';
import type { Rol, NuevoRolInput, ActualizarRolInput } from '@/types/rol';

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/roles`;
}

export async function getRoles(): Promise<Rol[]> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url);
  return extractRolesFromResponse(payload);
}

export async function getRolById(id: string): Promise<Rol | null> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  return extractRolFromResponse(payload);
}

export async function createRol(input: NuevoRolInput): Promise<Rol | null> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'roles',
        attributes: {
          nombre: input.nombre,
          permisos: permisosToStrings(input.permisos),
        },
      },
    },
  });
  return extractRolFromResponse(payload);
}

export async function updateRol(id: string, input: ActualizarRolInput): Promise<Rol | null> {
  const url = await baseUrl();
  const attributes: Record<string, unknown> = { version: input.version };

  if (input.nombre !== undefined) attributes.nombre = input.nombre;
  if (input.permisos !== undefined) attributes.permisos = permisosToStrings(input.permisos);

  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'roles', attributes } },
  });
  return extractRolFromResponse(payload);
}

export async function deleteRol(id: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}

export async function asignarRol(rolId: string, usuarioId: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${rolId}/asignar`, {
    method: 'POST',
    contentType: 'json-api',
    json: { data: { type: 'roles', attributes: { usuario_id: usuarioId } } },
  });
}

export async function revocarRol(rolId: string, usuarioId: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${rolId}/revocar?usuario_id=${usuarioId}`, {
    method: 'DELETE',
  });
}
