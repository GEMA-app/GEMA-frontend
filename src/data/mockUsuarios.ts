import type { Usuario } from '@/types/usuario';

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: '1',
    iniciales: 'CT',
    nombre: 'Cesar Torres',
    email: 'cesartorres@gmail.com',
    rol: 'Administrador',
    departamento: 'Infraestructura',
    estado: 'Activo',
  },
  {
    id: '2',
    iniciales: 'JM',
    nombre: 'Juan Mora',
    email: 'juanmora@gmail.com',
    rol: 'Técnico',
    departamento: 'Laboratorios',
    estado: 'Activo',
  },
  {
    id: '3',
    iniciales: 'JP',
    nombre: 'Juan Pérez',
    email: 'juanperez@gmail.com',
    rol: 'Supervisor',
    departamento: 'Mantenimiento',
    estado: 'Activo',
  },
  {
    id: '4',
    iniciales: 'ML',
    nombre: 'María López',
    email: 'marialopez@gmail.com',
    rol: 'Técnico',
    departamento: 'Laboratorios',
    estado: 'Inactivo',
  },
];

export function getMockUsuarios(
  page: number,
  perPage: number,
  search = '',
): { usuarios: Usuario[]; total: number; lastPage: number } {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? MOCK_USUARIOS.filter(
        (usuario) =>
          usuario.nombre.toLowerCase().includes(query) ||
          usuario.email.toLowerCase().includes(query) ||
          usuario.rol.toLowerCase().includes(query) ||
          usuario.departamento.toLowerCase().includes(query),
      )
    : MOCK_USUARIOS;

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(page, 1), lastPage);
  const start = (safePage - 1) * perPage;
  const usuarios = filtered.slice(start, start + perPage);

  return { usuarios, total, lastPage };
}
