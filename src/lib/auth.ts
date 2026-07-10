const TOKEN_KEY = 'token';
const EMPRESA_ID_KEY = 'empresaId';

type SessionPayload = Record<string, unknown>;

function asRecord(value: unknown): SessionPayload | null {
  return value && typeof value === 'object' ? (value as SessionPayload) : null;
}

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
  const usuario = asRecord(loginResponse.usuario) ?? asRecord(data?.usuario);
  const token = pickString(
    loginResponse.token,
    loginResponse.access_token,
    data?.token,
    data?.access_token,
    usuario?.token,
  );

  const empresaId = pickString(
    loginResponse.empresa_id,
    loginResponse.empresaId,
    data?.empresa_id,
    data?.empresaId,
    usuario?.empresa_id,
    usuario?.empresaId,
  );

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (empresaId) {
    localStorage.setItem(EMPRESA_ID_KEY, empresaId);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMPRESA_ID_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
