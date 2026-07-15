import { fetchWithAuth } from '@/lib/api';

export async function login(email: string, password: string): Promise<Record<string, unknown>> {
  return fetchWithAuth<Record<string, unknown>>('/v1/auth/ingresar', {
    method: 'POST',
    contentType: 'json-api',
    auth: false,
    json: {
      data: {
        type: 'tokens',
        attributes: { email, password },
      },
    },
  });
}

export async function register(data: {
  nombre: string;
  email: string;
  password: string;
  companyName: string;
}): Promise<void> {
  await fetchWithAuth('/v1/auth/registrar', {
    method: 'POST',
    contentType: 'json-api',
    auth: false,
    json: {
      data: {
        type: 'tokens',
        attributes: {
          email: data.email,
          password: data.password,
          nombre: data.nombre,
          company_name: data.companyName,
          telefono: '',
        },
      },
    },
  });
}

export async function cambiarContrasena(
  contrasenaActual: string,
  contrasenaNueva: string,
): Promise<void> {
  await fetchWithAuth('/v1/auth/cambiar-contrasena', {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'auth',
        attributes: {
          contrasena_actual: contrasenaActual,
          contrasena_nueva: contrasenaNueva,
        },
      },
    },
  });
}

/**
 * Solicitar reset de contraseña por email.
 * Endpoint: POST /v1/auth/olvide-contrasena (público)
 */
export async function solicitarReset(email: string): Promise<void> {
  await fetchWithAuth('/v1/auth/olvide-contrasena', {
    method: 'POST',
    contentType: 'json-api',
    auth: false,
    json: {
      data: {
        type: 'auth',
        attributes: { email },
      },
    },
  });
}

/**
 * Restablecer contraseña con token recibido por email.
 * Endpoint: POST /v1/auth/restablecer-contrasena (público)
 */
export async function restablecerContrasena(
  token: string,
  contrasenaNueva: string,
): Promise<void> {
  await fetchWithAuth('/v1/auth/restablecer-contrasena', {
    method: 'POST',
    contentType: 'json-api',
    auth: false,
    json: {
      data: {
        type: 'auth',
        attributes: {
          token,
          contrasena_nueva: contrasenaNueva,
        },
      },
    },
  });
}
