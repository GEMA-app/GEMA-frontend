export type TipoUbicacion = 'sede' | 'planta' | 'area' | 'seccion';

export interface Ubicacion {
  id: string;
  nombre: string;
  tipo: TipoUbicacion;
  descripcion: string | null;
  parentId?: string | null;
  hijos?: Ubicacion[];
  version?: number;
}

export interface NuevaUbicacionForm {
  nombre: string;
  tipo: TipoUbicacion;
  parentId?: string | null;
  descripcion?: string | null;
}
