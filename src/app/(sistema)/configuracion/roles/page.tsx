'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useRoles } from '@/hooks/useRoles';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos';
import { buildPermisosMatrix, matrixToPermisos } from '@/lib/roles';
import type { Rol, NuevoRolInput } from '@/types/rol';

const MODULO_LABELS: Record<string, string> = {
  activos: 'Activos',
  mantenimiento: 'Mantenimiento',
  inventario: 'Inventario',
  reportes: 'Reportes',
  administracion: 'Administración',
  preferencias: 'Preferencias',
};

const ACCION_LABELS: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

const MODULO_VALUES = Object.values(MODULOS_RBAC) as ModuloRBAC[];
const ACCION_VALUES = [...ACCIONES_RBAC] as AccionRBAC[];

export default function GestionRolesPage() {
  const { roles, loading, error, empty, crearRol, editarRol, eliminarRol, refetch } = useRoles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [nombre, setNombre] = useState('');
  const [matrix, setMatrix] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingRol(null);
    setNombre('');
    const emptyMatrix: Record<string, boolean> = {};
    for (const m of MODULO_VALUES) {
      for (const a of ACCION_VALUES) {
        emptyMatrix[`${m}:${a}`] = false;
      }
    }
    setMatrix(emptyMatrix);
    setModalOpen(true);
  };

  const openEdit = (rol: Rol) => {
    setEditingRol(rol);
    setNombre(rol.nombre);
    setMatrix(buildPermisosMatrix(rol.permisos));
    setModalOpen(true);
  };

  const togglePermiso = (key: string) => {
    setMatrix((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const permisos = matrixToPermisos(matrix);
      if (editingRol) {
        await editarRol(editingRol.id, { nombre: nombre.trim(), permisos, version: editingRol.version });
      } else {
        await crearRol({ nombre: nombre.trim(), permisos } as NuevoRolInput);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar el rol.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rol: Rol) => {
    if (!window.confirm(`¿Eliminar el rol "${rol.nombre}"?`)) return;
    try {
      await eliminarRol(rol.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el rol.');
    }
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Configuración / Roles"
        variant="configuracion"
        className="mb-8"
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Gestión de roles</h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + Nuevo rol
          </button>
        </div>

        <RequestState loading={loading} error={error} empty={empty} emptyMessage="No hay roles registrados." onRetry={refetch}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-sm font-semibold text-gray-900">Rol</th>
                <th className="pb-4 text-sm font-semibold text-gray-900">Módulos con acceso</th>
                <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <tr key={rol.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 font-semibold text-gray-900">{rol.nombre}</td>
                  <td className="py-4 text-gray-600 text-sm">
                    {rol.permisos.map((p) => MODULO_LABELS[p.modulo] || p.modulo).join(', ')}
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => openEdit(rol)} className="text-sm text-blue-600 hover:underline mr-4">Editar</button>
                    <button onClick={() => handleDelete(rol)} className="text-sm text-red-500 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RequestState>
      </div>

      {/* Modal de crear/editar rol */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingRol ? 'Editar rol' : 'Nuevo rol'}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del rol</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ECA03C]"
              />
            </div>

            <h4 className="text-sm font-semibold text-gray-900 mb-3">Permisos</h4>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left text-gray-700">Módulo</th>
                  {ACCION_VALUES.map((a) => (
                    <th key={a} className="pb-2 text-center text-gray-700">{ACCION_LABELS[a]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULO_VALUES.map((m) => (
                  <tr key={m} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{MODULO_LABELS[m]}</td>
                    {ACCION_VALUES.map((a) => (
                      <td key={a} className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={matrix[`${m}:${a}`] || false}
                          onChange={() => togglePermiso(`${m}:${a}`)}
                          className="w-4 h-4 rounded border-gray-300 accent-[#ECA03C]"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
