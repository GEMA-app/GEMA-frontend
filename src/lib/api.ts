import { clearSession, getEmpresaId, getToken, refreshSession } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type ContentType = 'json' | 'json-api';

export type FetchWithAuthOptions = RequestInit & {
  json?: unknown;
  contentType?: ContentType;
  auth?: boolean;
};

function buildUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

function getContentTypeHeader(contentType: ContentType): string {
  return contentType === 'json-api' ? 'application/vnd.api+json' : 'application/json';
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();

    if (typeof payload === 'object' && payload !== null) {
      const record = payload as Record<string, unknown>;

      if (typeof record.mensaje === 'string') {
        return record.mensaje;
      }

      const errors = record.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0] as Record<string, unknown>;
        if (typeof first.detail === 'string') {
          return first.detail;
        }
      }

      if (typeof record.message === 'string') {
        return record.message;
      }
    }
  } catch {
    // ignore parse errors
  }

  return `Error ${response.status}: ${response.statusText || 'Solicitud fallida'}`;
}

async function executeFetch<T>(
  path: string,
  options: FetchWithAuthOptions,
): Promise<T> {
  const {
    json,
    contentType = 'json',
    auth = true,
    headers: customHeaders,
    body,
    ...rest
  } = options;

  const headers = new Headers(customHeaders);
  const acceptHeader = getContentTypeHeader(contentType);
  headers.set('Accept', acceptHeader);

  if (json !== undefined) {
    headers.set('Content-Type', acceptHeader);
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError('No hay sesión activa. Inicie sesión para continuar.', 401);
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : body,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchWithAuth<T>(
  path: string,
  options: FetchWithAuthOptions = {},
): Promise<T> {
  const { auth = true } = options;

  try {
    return await executeFetch<T>(path, options);
  } catch (err) {
    if (auth && err instanceof ApiError && err.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshSession()
          .catch(() => {
            clearSession();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new ApiError('Sesión expirada. Inicie sesión nuevamente.', 401);
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        return await executeFetch<T>(path, options);
      } catch (retryErr) {
        clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw retryErr;
      }
    }
    throw err;
  }
}

export async function requireEmpresaId(): Promise<string> {
  const empresaId = getEmpresaId();

  if (empresaId) {
    return empresaId;
  }

  const profile = await fetchWithAuth<Record<string, unknown>>('/v1/auth/yo');
  const data = profile.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  const usuario = profile.usuario as Record<string, unknown> | undefined;
  function str(v: unknown): string {
    return v != null ? String(v) : '';
  }

  const resolved =
    str(profile.empresa_id) ||
    str(profile.empresaId) ||
    str(data?.empresa_id) ||
    str(data?.empresaId) ||
    str(attributes?.empresa_id) ||
    str(attributes?.empresaId) ||
    str(usuario?.empresa_id) ||
    str(usuario?.empresaId) ||
    null;

  if (!resolved) {
    throw new ApiError('No se encontró una empresa asociada a la sesión.', 400);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('empresaId', resolved);
  }

  return resolved;
}
