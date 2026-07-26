'use client';

import { useCallback, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useRoles } from '@/hooks/useRoles';
import { buildPermisosMatrix, matrixToPermisos } from '@/lib/roles';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos';
import type { PermisoGranular, Rol } from '@/types/rol';

const MODULOS_LABELS: Record<ModuloRBAC, string> = {
  activos: 'Activos',
  ubicaciones: 'Ubicaciones',
  mantenimiento: 'Mantenimiento',
  inventario: 'Inventario',
  reportes: 'Reportes',
  administracion: 'Administración',
  preferencias: 'Preferencias',
  proveedores: 'Proveedores',
};

const ACCIONES_LABELS: Record<AccionRBAC, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

function RolRow({ rol, onEdit, onDelete }: { rol: Rol; onEdit: (rol: Rol) => void; onDelete: (id: string) => void }) {
  const matrix = buildPermisosMatrix(rol.permisos);
  const modulos = Object.values(MODULOS_RBAC);
  const acciones = [...ACCIONES_RBAC];

  return (
    <tr className="border-b border-[#EBE2D5] hover:bg-white/50">
      <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{rol.nombre}</td>
      {modulos.map((modulo) => (
        <td key={modulo} className="px-2 py-3 text-center">
          <div className="flex gap-1 justify-center">
            {acciones.map((accion) => (
              <span
                key={accion}
                className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold ${
                  matrix[`${modulo}:${accion}`]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
                title={`${MODULOS_LABELS[modulo]} - ${ACCIONES_LABELS[accion]}`}
              >
                {ACCIONES_LABELS[accion][0]}
              </span>
            ))}
          </div>
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => onEdit(rol)}
            className="text-xs text-blue-600 hover:underline cursor-pointer"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(rol.id)}
            className="text-xs text-red-600 hover:underline cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function RolesPage() {
  const { roles, loading, error, empty, refetch, crearRol, editarRol, eliminarRol } = useRoles();
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [nombre, setNombre] = useState('');
  const [matrix, setMatrix] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const modulos = Object.values(MODULOS_RBAC);
  const acciones = [...ACCIONES_RBAC];

  const resetForm = useCallback(() => {
    setNombre('');
    setMatrix({});
    setEditingRol(null);
    setShowCreate(false);
  }, []);

  const handleEdit = useCallback((rol: Rol) => {
    setEditingRol(rol);
    setNombre(rol.nombre);
    setMatrix(buildPermisosMatrix(rol.permisos));
    setShowCreate(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const permisos = matrixToPermisos(matrix);
      if (editingRol) {
        await editarRol(editingRol.id, { nombre, permisos, version: editingRol.version });
      } else {
        await crearRol({ nombre, permisos });
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }, [nombre, matrix, editingRol, crearRol, editarRol, resetForm]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Eliminar este rol?')) return;
    await eliminarRol(id);
  }, [eliminarRol]);

  const togglePermiso = useCallback((modulo: string, accion: string) => {
    const key = `${modulo}:${accion}`;
    setMatrix((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader
        title="Roles y Permisos"
        subtitle="*Administrador*"
        subtitleClassName="italic"
        className="mb-4"
      />

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => { resetForm(); setShowCreate(true); }}
          className="bg-[#E5A93D] hover:bg-[#d19730] text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm"
        >
          + Crear rol
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-[#EBE2D5] bg-[#F7F4EF] p-5">
          <h3 className="font-bold text-gray-900 mb-4">
            {editingRol ? 'Editar rol' : 'Nuevo rol'}
          </h3>
          <div className="mb-4">
            <label htmlFor="rol-nombre" className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre del rol
            </label>
            <input
              id="rol-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#EBE2D5]">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Modulo</th>
                  {acciones.map((a) => (
                    <th key={a} className="px-3 py-2 text-center font-semibold text-gray-700">
                      {ACCIONES_LABELS[a]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulos.map((modulo) => (
                  <tr key={modulo} className="border-b border-[#EBE2D5]/50">
                    <td className="px-3 py-2 font-medium text-gray-800">{MODULOS_LABELS[modulo]}</td>
                    {acciones.map((accion) => (
                      <td key={accion} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!matrix[`${modulo}:${accion}`]}
                          onChange={() => togglePermiso(modulo, accion)}
                          className="w-4 h-4 rounded cursor-pointer accent-[#E5A93D]"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[#DED4C7] bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !nombre.trim()}
              className="rounded-xl bg-[#E5A93D] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d19730] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <RequestState loading={loading} error={error} empty={empty} emptyMessage="No hay roles definidos.">
        <div className="overflow-x-auto rounded-2xl border border-[#EBE2D5] bg-[#F7F4EF]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EBE2D5] bg-[#EBE2D5]/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Rol</th>
                {modulos.map((m) => (
                  <th key={m} className="px-2 py-3 text-center text-[10px] font-bold text-gray-700 uppercase">
                    {MODULOS_LABELS[m]}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <RolRow key={rol.id} rol={rol} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </RequestState>
    </div>
  );
}