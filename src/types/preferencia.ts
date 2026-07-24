export type TemaPreferencia = 'oscuro' | 'claro' | 'sistema';

export interface Preferencia {
  id: string;
  empresa_id: string;
  tema: TemaPreferencia;
  version: number;
}

export interface ActualizarPreferenciaInput {
  tema: TemaPreferencia;
  version: number;
}