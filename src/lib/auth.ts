import { asRecord } from '@/lib/jsonapi';

type SessionPayload = Record<string, unknown>;

const TOKEN_KEY = 'token';
const EMPRESA_ID_KEY = 'empresaId';
const ROLES_KEY = 'roles';
const USER_NAME_KEY = 'userName';
const REFRESH_TOKEN_KEY = 'refreshToken';

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return null;
}

const ROLE_SLUG_MAP: Record<string, string> = {
  administrador: 'admin',
  admin: 'admin',
  'supervisor de activos': 'supervisor-activos',
  'supervisor de operaciones': 'supervisor-operaciones',
  supervisor: 'supervisor-operaciones',
  'técnico de mantenimiento': 'tecnico',
  'tecnico de mantenimiento': 'tecnico',
  técnico: 'tecnico',
  tecnico: 'tecnico',
  almacenista: 'almacenista',
  'consultor (solo lectura)': 'consultor',
  consultor: 'consultor',
  reporter: 'reporter',
};

function normalizeRoles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((role) => {
      if (typeof role === 'string') {
        return role.trim().toLowerCase();
      }
      if (role && typeof role === 'object' && 'name' in role) {
        const name = (role as { name?: unknown }).name;
        return typeof name === 'string' ? name.trim().toLowerCase() : '';
      }
      return '';
    })
    .filter(Boolean)
    .map((r) => ROLE_SLUG_MAP[r] || r);
}

export function extractRolesFromPayload(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const data = asRecord(record.data);
  const attributes = asRecord(data?.attributes);
  const usuario = asRecord(record.usuario) ?? asRecord(data?.usuario);

  return normalizeRoles(
    record.roles ??
      record.roles_asignados ??
      data?.roles ??
      data?.roles_asignados ??
      attributes?.roles ??
      usuario?.roles ??
      usuario?.roles_asignados,
  );
}

export function setRoles(roles: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(ROLES_KEY, JSON.stringify(normalizeRoles(roles)));
}

export function getRoles(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(ROLES_KEY);
  if (!raw) {
    return [];
  }

  try {
    return normalizeRoles(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function hasAnyRole(requiredRoles: string[]): boolean {
  const userRoles = getRoles();
  const normalized = requiredRoles.map((role) => role.trim().toLowerCase());
  return normalized.some((role) => userRoles.includes(role));
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(USER_NAME_KEY);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function getEmpresaId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(EMPRESA_ID_KEY);
}

export function setSession(loginResponse: SessionPayload): void {
  if (typeof window === 'undefined') {
    return;
  }

  const data = asRecord(loginResponse.data);
  const attributes = asRecord(data?.attributes);
  const usuario = asRecord(loginResponse.usuario) ?? asRecord(data?.usuario);
  const token = pickString(
    loginResponse.token,
    loginResponse.access_token,
    data?.token,
    data?.access_token,
    attributes?.access_token,
    usuario?.token,
  );

  const empresaId = pickString(
    loginResponse.empresa_id,
    loginResponse.empresaId,
    data?.empresa_id,
    data?.empresaId,
    attributes?.empresa_id,
    attributes?.empresaId,
    usuario?.empresa_id,
    usuario?.empresaId,
  );

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  const refreshToken = pickString(
    loginResponse.refresh_token,
    data?.refresh_token,
    attributes?.refresh_token,
  );
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (empresaId) {
    localStorage.setItem(EMPRESA_ID_KEY, empresaId);
  }

  const roles = extractRolesFromPayload(loginResponse);
  if (roles.length > 0) {
    setRoles(roles);
  }

  const userName = pickString(
    data?.usuario,
    loginResponse.usuario,
    usuario?.name,
    usuario?.nombre,
    attributes?.nombre,
  );
  if (userName) {
    localStorage.setItem(USER_NAME_KEY, userName);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMPRESA_ID_KEY);
  localStorage.removeItem(ROLES_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function ensureSessionRoles(): Promise<string[]> {
  const existing = getRoles();
  if (existing.length > 0) {
    return existing;
  }

  if (!getToken()) {
    throw new Error('No hay sesión activa');
  }

  const { fetchWithAuth } = await import('@/lib/api');
  const profile = await fetchWithAuth<unknown>('/v1/auth/yo');
  const roles = extractRolesFromPayload(profile);

  if (roles.length > 0) {
    setRoles(roles);
  }

  return roles;
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function refreshSession(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No hay refresh token.');
  const { fetchWithAuth } = await import('@/lib/api');
  const payload = await fetchWithAuth<Record<string, unknown>>('/v1/auth/refrescar', {
    method: 'POST',
    auth: false,
    contentType: 'json-api',
    json: { data: { type: 'tokens', attributes: { refresh_token: refreshToken } } },
  });
  setSession(payload);
}
