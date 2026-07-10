import type { Ubicacion } from '@/types/ubicacion';

export const mockUbicaciones: Ubicacion[] = [
  {
    id: '1',
    nombre: 'A-001',
    jerarquia: 'ZONA 123 / Mantenimiento de conectores',
    tipo: 'Área técnica / Planta baja',
    proceso: 'alta',
    estado: 'completado',
    hijos: [
      {
        id: '1-1',
        parentId: '1',
        nombre: 'ZONA NORTE / Ubicación: UB-002',
        jerarquia: 'Subzona norte / Pasillo principal',
        tipo: 'JERARQUÍA SUPERIOR / Sede Principal',
        proceso: 'media',
        estado: 'en_progreso',
      },
      {
        id: '1-2',
        parentId: '1',
        nombre: 'UB-003',
        jerarquia: 'Sala de máquinas / Rack 4',
        tipo: 'Punto de instalación',
        proceso: 'baja',
        estado: 'pendiente',
      },
    ],
  },
  {
    id: '2',
    nombre: 'B-014',
    jerarquia: 'ZONA SUR / Laboratorio químico',
    tipo: 'Laboratorio / Piso 2',
    proceso: 'media',
    estado: 'en_progreso',
    hijos: [
      {
        id: '2-1',
        parentId: '2',
        nombre: 'UB-010',
        jerarquia: 'Campana extractora / Estación 1',
        tipo: 'Estación de trabajo',
        proceso: 'alta',
        estado: 'completado',
      },
    ],
  },
  {
    id: '3',
    nombre: 'C-205',
    jerarquia: 'Almacén central / Estante C',
    tipo: 'Almacén / Depósito',
    proceso: 'baja',
    estado: 'pendiente',
  },
];
