export type TipoUbicacion = 'sede' | 'planta' | 'area' | 'seccion';
export type ProcesoUbicacion = 'alta' | 'media' | 'baja';
export type EstadoUbicacion = 'completado' | 'en_progreso' | 'pendiente';

export interface Ubicacion {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  jerarquia: string;
  proceso: ProcesoUbicacion;
  estado: EstadoUbicacion;
  parentId?: string | null;
  hijos?: Ubicacion[];
}

export interface NuevaUbicacionForm {
  nombre: string;
  tipo: string;
  parentId?: string | null;
  descripcion?: string | null;
}
