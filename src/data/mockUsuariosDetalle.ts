import type { UsuarioDetalle } from '@/types/usuario';
import { buildPermisosFromRol } from '@/lib/permisos';

export const MOCK_USUARIOS_DETALLE: Record<string, UsuarioDetalle> = {
  '1': {
    id: '1',
    iniciales: 'CT',
    nombre: 'CESAR TORRES',
    codigo: '100001',
    sede: 'CARACAS',
    email: 'cesartorres@gmail.com',
    rol: 'ADMINISTRADOR',
    rolSlug: 'admin',
    cargo: 'Director de Infraestructura',
    fechaIngreso: '03 Mar 2022',
    ultimoAcceso: 'Hoy, 09:15',
    permisos: buildPermisosFromRol('admin'),
  },
  '2': {
    id: '2',
    iniciales: 'JM',
    nombre: 'JUAN MORA',
    codigo: '100245',
    sede: 'VALENCIA',
    email: 'juanmora@gmail.com',
    rol: 'TÉCNICO',
    rolSlug: 'tecnico',
    cargo: 'Técnico de Laboratorio',
    fechaIngreso: '18 Ago 2023',
    ultimoAcceso: 'Ayer, 16:40',
    permisos: buildPermisosFromRol('tecnico'),
  },
  '3': {
    id: '3',
    iniciales: 'JP',
    nombre: 'JUAN PEREZ',
    codigo: '123456',
    sede: 'LIMA',
    email: 'juanperez@gmail.com',
    rol: 'TÉCNICO',
    rolSlug: 'tecnico',
    cargo: 'Administrador de Sistemas',
    fechaIngreso: '15 Ene 2024',
    ultimoAcceso: 'Hoy, 10:30',
    permisos: buildPermisosFromRol('tecnico'),
  },
  '4': {
    id: '4',
    iniciales: 'ML',
    nombre: 'MARÍA LÓPEZ',
    codigo: '100512',
    sede: 'LIMA',
    email: 'marialopez@gmail.com',
    rol: 'SUPERVISOR',
    rolSlug: 'supervisor',
    cargo: 'Supervisora de Laboratorios',
    fechaIngreso: '22 Nov 2021',
    ultimoAcceso: '12 Jun 2026, 08:00',
    permisos: buildPermisosFromRol('supervisor'),
  },
};

export function getMockUsuarioDetalle(id: string): UsuarioDetalle | null {
  return MOCK_USUARIOS_DETALLE[id] ?? null;
}
