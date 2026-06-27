// Cliente API GEMA — maneja JSON:API, tenant y control de versiones
type JsonApiResponse = any;

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api').replace(/\/$/, '');
const JSONAPI_CONTENT = 'application/vnd.api+json';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || null;
}

const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUUIDv4(id: string) {
  return uuidV4Regex.test(id);
}

export function persistAuthToken(payload: any) {
  const token = payload?.token || payload?.access_token || payload?.accessToken || payload?.data?.attributes?.token || payload?.data?.token || payload?.data?.access_token;
  if (token && typeof window !== 'undefined') {
    localStorage.setItem('token', String(token));
  }
}

async function fetchJSONAPI(path: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': JSONAPI_CONTENT,
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

    if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    throw err;
  }

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    let json: JsonApiResponse | null = null;

    // Only try to parse JSON when content-type indicates JSON and body is not empty
    if (text && (contentType.includes('application/vnd.api+json') || contentType.includes('application/json'))) {
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        const err = new Error(`Invalid JSON response (status ${res.status}): ${String(text).slice(0,200)}`);
        (err as any).status = res.status;
        throw err;
      }
    }

    if (!res.ok) {
      const message = json?.errors?.[0]?.detail || text || `HTTP ${res.status}`;
      const err = new Error(message);
      (err as any).status = res.status;
      throw err;
    }

    return json;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo conectar con el servidor';
    const err = new Error(message === 'Failed to fetch' ? 'No se pudo conectar con el servidor. Verifique que el backend esté disponible.' : message);
    (err as any).status = (error as any)?.status ?? 0;
    throw err;
  }
}

export async function getCurrentUser() {
  return await fetchJSONAPI('/v1/auth/yo');
}

export async function getEmpresaId(): Promise<string> {
  const res = await getCurrentUser();
  const empresaId = res?.data?.attributes?.empresa_id || res?.data?.attributes?.empresa?.id;
  if (!empresaId) throw new Error('empresa_id not found in /v1/auth/yo response');
  if (!isUUIDv4(String(empresaId))) throw new Error('empresa_id is not a valid UUID v4');
  return String(empresaId);
}

export async function getActivos(empresaId: string) {
  if (!isUUIDv4(empresaId)) throw new Error('empresaId must be UUID v4');
  const res = await fetchJSONAPI(`/v1/empresas/${empresaId}/activos`);
  const items = (res?.data || []).map((d: any) => ({ value: String(d.id), label: d.attributes?.nombre || d.attributes?.display_name || d.id }));
  return items.filter((it: any) => isUUIDv4(it.value));
}

export async function getUsuarios(empresaId: string) {
  if (!isUUIDv4(empresaId)) throw new Error('empresaId must be UUID v4');
  const res = await fetchJSONAPI(`/v1/empresas/${empresaId}/usuarios`);
  const items = (res?.data || []).map((d: any) => ({ value: String(d.id), label: d.attributes?.nombre || d.attributes?.full_name || d.id }));
  return items.filter((it: any) => isUUIDv4(it.value));
}

export async function getActivoById(empresaId: string, activoId: string) {
  if (!isUUIDv4(empresaId) || !isUUIDv4(activoId)) throw new Error('IDs must be UUID v4');
  const res = await fetchJSONAPI(`/v1/empresas/${empresaId}/activos/${activoId}`);
  const attributes = res?.data?.attributes || {};
  const version = attributes?.version;
  return { attributes, version };
}

export async function patchActivo(empresaId: string, activoId: string, attributes: Record<string, any>, version: string | number) {
  if (!isUUIDv4(empresaId) || !isUUIDv4(activoId)) throw new Error('IDs must be UUID v4');
  const body = {
    data: {
      id: String(activoId),
      type: 'activos',
      attributes: { ...attributes, version },
    },
  };
  const res = await fetchJSONAPI(`/v1/empresas/${empresaId}/activos/${activoId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return res?.data?.attributes;
}

export async function createOrden(empresaId: string, payload: Record<string, any>) {
  if (!isUUIDv4(empresaId)) throw new Error('empresaId must be UUID v4');
  const body = { data: { type: 'ordenes', attributes: payload } };
  const res = await fetchJSONAPI(`/v1/empresas/${empresaId}/ordenes`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res?.data?.attributes;
}

export default {
  getCurrentUser,
  getEmpresaId,
  getActivos,
  getUsuarios,
  getActivoById,
  patchActivo,
  createOrden,
  isUUIDv4,
};
