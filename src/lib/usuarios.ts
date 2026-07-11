import type { Usuario, UsuariosMeta, UsuarioDetalle } from '@/types/usuario';
import { buildPermisosFromRol } from '@/lib/permisos';

const ROL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  administrador: 'Administrador',
  tecnico: 'Técnico',
  técnico: 'Técnico',
  supervisor: 'Supervisor',
  reporter: 'Reporter',
};

export function getIniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'U';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatRol(rol: string): string {
  const normalized = rol.trim().toLowerCase();
  return ROL_LABELS[normalized] ?? rol;
}

export function formatEstado(estado: string): string {
  const normalized = estado.trim().toLowerCase();
  if (normalized === 'activo') return 'Activo';
  if (normalized === 'inactivo') return 'Inactivo';
  if (normalized === 'suspendido') return 'Suspendido';
  return estado;
}

type ApiUser = {
  id: number | string;
  name?: string;
  email?: string;
  estado?: string;
  roles?: string[];
  departamento?: string;
  department?: string;
  created_at?: string;
  updated_at?: string;
};

function padCodigo(id: string | number): string {
  return String(id).padStart(6, '0');
}

function formatFechaDetalle(value?: string): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatUltimoAcceso(value?: string): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hoy, ${time}`;
  }
  if (isYesterday) {
    return `Ayer, ${time}`;
  }

  return `${formatFechaDetalle(value)}, ${time}`;
}

function extractApiUser(payload: unknown): ApiUser | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const data = record.data;

  if (data && typeof data === 'object') {
    return data as ApiUser;
  }

  return record as ApiUser;
}

export function mapUsuarioDetalleFromApi(payload: unknown): UsuarioDetalle | null {
  const user = extractApiUser(payload);
  if (!user?.id) {
    return null;
  }

  const nombre = user.name ?? '';
  const rolRaw =
    Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : 'sin rol';
  const rolSlug = rolRaw.trim().toLowerCase();

  return {
    id: String(user.id),
    iniciales: getIniciales(nombre),
    nombre: nombre.toUpperCase(),
    codigo: padCodigo(user.id),
    sede: 'LIMA',
    email: user.email ?? '',
    rol: formatRol(rolRaw).toUpperCase(),
    rolSlug,
    cargo: formatRol(rolRaw),
    fechaIngreso: formatFechaDetalle(user.created_at),
    ultimoAcceso: formatUltimoAcceso(user.updated_at ?? user.created_at),
    permisos: buildPermisosFromRol(rolSlug),
  };
}

export function mapUsuarioFromApi(user: ApiUser): Usuario {
  const nombre = user.name ?? '';
  const rolRaw = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : 'Sin rol';

  return {
    id: String(user.id),
    iniciales: getIniciales(nombre),
    nombre,
    email: user.email ?? '',
    rol: formatRol(rolRaw),
    departamento: user.departamento ?? user.department ?? 'N/A',
    estado: formatEstado(user.estado ?? 'inactivo'),
  };
}

export function extractUsuariosMeta(
  payload: unknown,
  page: number,
  perPage: number,
): UsuariosMeta {
  if (!payload || typeof payload !== 'object') {
    return { page, perPage, total: 0, lastPage: 1 };
  }

  const record = payload as Record<string, unknown>;
  const meta = record.meta as Record<string, unknown> | undefined;
  const data = record.data;

  const total =
    (typeof meta?.total === 'number' && meta.total) ||
    (Array.isArray(data) ? data.length : 0);

  const lastPage =
    (typeof meta?.last_page === 'number' && meta.last_page) ||
    Math.max(1, Math.ceil(total / perPage));

  const currentPage = (typeof meta?.current_page === 'number' && meta.current_page) || page;
  const currentPerPage = (typeof meta?.per_page === 'number' && meta.per_page) || perPage;

  return {
    page: currentPage,
    perPage: currentPerPage,
    total,
    lastPage,
  };
}

export function extractUsuariosFromResponse(payload: unknown): Usuario[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const data = record.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => mapUsuarioFromApi(item as ApiUser));
}
