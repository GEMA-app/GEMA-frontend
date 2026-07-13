import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import {
  extractUsuariosFromResponse,
  extractUsuariosMeta,
  mapUsuarioDetalleFromApi,
} from '@/lib/usuarios';
import type {
  ActualizarUsuarioInput,
  NuevoUsuarioInput,
  Usuario,
  UsuarioDetalle,
  UsuariosMeta,
} from '@/types/usuario';

const ROLE_NAME_MAP: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor de Activos',
  tecnico: 'Técnico de Mantenimiento',
  reporter: 'Reporter',
};

export interface UsuariosQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface UsuariosResponse {
  usuarios: Usuario[];
  meta: UsuariosMeta;
}

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/usuarios`;
}

async function rolesUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/roles`;
}

async function findRoleId(rolSlug: string): Promise<string> {
  const roleName = ROLE_NAME_MAP[rolSlug] || rolSlug;
  const url = await rolesUrl();
  const res = await fetchWithAuth<{ data: Array<{ id: string; attributes: { nombre: string } }> }>(url);
  const found = (res.data ?? []).find((r) => r.attributes.nombre === roleName);
  if (!found) throw new Error(`Rol "${roleName}" no encontrado en la empresa.`);
  return found.id;
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
  const base = await baseUrl();

  const payload = await fetchWithAuth<unknown>(`${base}${query}`);

  return {
    usuarios: extractUsuariosFromResponse(payload),
    meta: extractUsuariosMeta(payload, page, perPage),
  };
}

export async function getUsuarioById(id: string): Promise<UsuarioDetalle> {
  const base = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${base}/${id}`);
  const usuario = mapUsuarioDetalleFromApi(payload);

  if (!usuario) {
    throw new Error('No se pudo interpretar la respuesta del usuario.');
  }

  return usuario;
}

export async function updateUsuario(id: string, input: ActualizarUsuarioInput): Promise<UsuarioDetalle> {
  const base = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${base}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'users',
        attributes: {
          nombre: input.nombre,
          email: input.email,
          activo: input.activo,
        },
      },
    },
  });

  const usuario = mapUsuarioDetalleFromApi(payload);
  if (!usuario) throw new Error('No se pudo interpretar la respuesta del usuario actualizado.');

  const rolId = await findRoleId(input.rol);
  const rolesBase = await rolesUrl();
  await fetchWithAuth(`${rolesBase}/${rolId}/asignar`, {
    method: 'POST',
    contentType: 'json-api',
    json: { data: { type: 'roles', attributes: { usuario_id: id } } },
  });

  return input.cargo ? { ...usuario, cargo: input.cargo } : usuario;
}

export async function createUsuario(input: NuevoUsuarioInput): Promise<Usuario> {
  const base = await baseUrl();
  const payload = await fetchWithAuth<{ data: { id: string } }>(base, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'users',
        attributes: {
          email: input.email,
          password: input.password,
          nombre: input.nombre,
          telefono: null,
        },
      },
    },
  });

  const userId = payload.data.id;
  const rolId = await findRoleId(input.rol);
  const rolesBase = await rolesUrl();
  await fetchWithAuth(`${rolesBase}/${rolId}/asignar`, {
    method: 'POST',
    contentType: 'json-api',
    json: { data: { type: 'roles', attributes: { usuario_id: userId } } },
  });

  const detalles = await getUsuarioById(userId);
  return {
    id: detalles.id,
    iniciales: detalles.iniciales,
    nombre: detalles.nombre,
    email: detalles.email,
    rol: detalles.rol,
    departamento: 'N/A',
    activo: true,
  };
}

export async function deleteUsuario(id: string): Promise<void> {
  const base = await baseUrl();
  await fetchWithAuth(`${base}/${id}`, { method: 'DELETE' });
}
