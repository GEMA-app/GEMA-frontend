import { fetchWithAuth } from '@/lib/api';
import {
  extractUsuariosFromResponse,
  extractUsuariosMeta,
  mapUsuarioFromApi,
  mapUsuarioDetalleFromApi,
} from '@/lib/usuarios';
import type {
  ActualizarUsuarioInput,
  NuevoUsuarioInput,
  Usuario,
  UsuarioDetalle,
  UsuariosMeta,
} from '@/types/usuario';

export interface UsuariosQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface UsuariosResponse {
  usuarios: Usuario[];
  meta: UsuariosMeta;
}

function buildUsuariosQuery(params: UsuariosQuery): string {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;

  searchParams.set('page', String(page));
  searchParams.set('per_page', String(perPage));

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  return `?${searchParams.toString()}`;
}

export async function getUsuarios(params: UsuariosQuery = {}): Promise<UsuariosResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const query = buildUsuariosQuery({ ...params, page, perPage });

  const payload = await fetchWithAuth<unknown>(`/admin/users${query}`);

  return {
    usuarios: extractUsuariosFromResponse(payload),
    meta: extractUsuariosMeta(payload, page, perPage),
  };
}

export async function getUsuarioById(id: string): Promise<UsuarioDetalle> {
  const payload = await fetchWithAuth<unknown>(`/admin/users/${id}`);
  const usuario = mapUsuarioDetalleFromApi(payload);

  if (!usuario) {
    throw new Error('No se pudo interpretar la respuesta del usuario.');
  }

  return usuario;
}

export async function updateUsuario(id: string, input: ActualizarUsuarioInput): Promise<UsuarioDetalle> {
  const payload = await fetchWithAuth<unknown>(`/admin/users/${id}`, {
    method: 'PUT',
    json: {
      name: input.nombre,
      email: input.email,
      estado: input.estado,
      roles: [input.rol.toLowerCase()],
    },
  });

  const usuario = mapUsuarioDetalleFromApi(payload);
  if (!usuario) {
    throw new Error('No se pudo interpretar la respuesta del usuario actualizado.');
  }

  if (input.cargo) {
    return { ...usuario, cargo: input.cargo };
  }

  return usuario;
}

export async function createUsuario(input: NuevoUsuarioInput): Promise<Usuario> {
  const payload = await fetchWithAuth<{ data?: Record<string, unknown> }>('/admin/users', {
    method: 'POST',
    json: {
      name: input.nombre,
      email: input.email,
      password: '12345678',
      password_confirmation: '12345678',
      estado: input.estado,
      roles: [input.rol.toLowerCase()],
      telefono: null,
    },
  });

  const data = payload.data ?? (payload as Record<string, unknown>);
  return mapUsuarioFromApi(data as Parameters<typeof mapUsuarioFromApi>[0]);
}

export async function deleteUsuario(id: string): Promise<void> {
  await fetchWithAuth(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function updateUsuarioRoles(id: string, roles: string[]): Promise<void> {
  await fetchWithAuth(`/admin/users/${id}/roles`, {
    method: 'PATCH',
    json: { roles },
  });
}
