export type TipoUbicacion = 'sede' | 'planta' | 'area' | 'seccion';

export interface Ubicacion {
  id: string;
  nombre: string;
  tipo: TipoUbicacion;
  descripcion: string | null;
  version: number;
  parentId?: string | null;
  hijos?: Ubicacion[];
}

export interface NuevaUbicacionForm {
  nombre: string;
  tipo: TipoUbicacion;
  parentId?: string | null;
  descripcion?: string | null;
}

export interface ActualizarUbicacionForm {
  nombre?: string;
  tipo?: TipoUbicacion;
  parentId?: string | null;
  descripcion?: string | null;
  version: number;
}

