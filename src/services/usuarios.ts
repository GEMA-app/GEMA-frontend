import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractUsuariosFromResponse, extractUsuariosMeta, mapUsuarioFromResource } from '@/lib/usuarios';
import type { ActualizarUsuarioInput, NuevoUsuarioInput, Usuario } from '@/types/usuario';

export interface UsuariosQuery {
  page?: number;
  perPage?: number;
  search?: string;
  activo?: boolean;
}

function buildQuery(params: UsuariosQuery): string {
  const q = new URLSearchParams();
  if (params.activo !== undefined) q.set('activo', String(params.activo));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function getUsuarios(params: UsuariosQuery = {}): Promise<{ usuarios: Usuario[]; meta: { total: number; offset: number; limit: number } }> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/usuarios${buildQuery(params)}`);
  return {
    usuarios: extractUsuariosFromResponse(payload),
    meta: extractUsuariosMeta(payload, 0, params.perPage ?? 15),
  };
}

export async function getUsuariosBasicos(params: UsuariosQuery = {}): Promise<{ usuarios: Usuario[]; meta: { total: number; offset: number; limit: number } }> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/usuarios/basico${buildQuery(params)}`);
  return {
    usuarios: extractUsuariosFromResponse(payload),
    meta: extractUsuariosMeta(payload, 0, params.perPage ?? 15),
  };
}

export async function getUsuarioById(id: string): Promise<Usuario> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/usuarios/${id}`);
  const usuario = mapUsuarioFromResource(payload);
  if (!usuario) throw new Error('No se pudo interpretar la respuesta del usuario.');
  return usuario;
}

export async function createUsuario(input: NuevoUsuarioInput): Promise<Usuario> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/usuarios`, {
    method: 'POST',
    json: {
      data: {
        type: 'users',
        attributes: {
          email: input.email,
          password: input.password,
          nombre: input.nombre,
          telefono: input.telefono ?? null,
        },
      },
    },
  });
  const usuario = mapUsuarioFromResource(payload);
  if (!usuario) throw new Error('No se pudo interpretar la respuesta del usuario creado.');
  return usuario;
}

export async function updateUsuario(id: string, input: ActualizarUsuarioInput): Promise<Usuario> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(`/v1/empresas/${empresaId}/usuarios/${id}`, {
    method: 'PATCH',
    json: {
      data: {
        type: 'users',
        attributes: {
          email: input.email,
          nombre: input.nombre,
          telefono: input.telefono,
          activo: input.activo,
        },
      },
    },
  });
  const usuario = mapUsuarioFromResource(payload);
  if (!usuario) throw new Error('No se pudo interpretar la respuesta del usuario actualizado.');
  return usuario;
}

export async function deleteUsuario(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/usuarios/${id}`, { method: 'DELETE' });
}
