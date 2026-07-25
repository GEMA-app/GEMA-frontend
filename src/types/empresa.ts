export type EstadoEmpresa = 'activa' | 'suspendida' | 'cancelada';

export interface Empresa {
  id: string;
  nombre: string;
  slug: string;
  estado: EstadoEmpresa;
  rif: string | null;
  email_contacto: string | null;
  plan_id: string | null;
  trial_hasta: string | null;
  version: number;
}

export interface ActualizarEmpresaInput {
  nombre?: string;
  rif?: string;
  email_contacto?: string;
  version: number;
}