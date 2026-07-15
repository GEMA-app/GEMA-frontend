'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { EditarUsuarioModal } from '@/components/usuarios/EditarUsuarioModal';
import { UsuariosBackLink } from '@/components/usuarios/UsuariosBackLink';
import { PermisoRow } from '@/components/usuarios/detalle/PermisoRow';
import { UsuarioDetalleActions } from '@/components/usuarios/detalle/UsuarioDetalleActions';
import { UsuarioDetalleHeader } from '@/components/usuarios/detalle/UsuarioDetalleHeader';
import { UsuarioInfoCard } from '@/components/usuarios/detalle/UsuarioInfoCard';
import { UsuarioStatCard } from '@/components/usuarios/detalle/UsuarioStatCard';
import { useUsuarioDetalle } from '@/hooks/useUsuarioDetalle';


export default function UsuarioDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { usuario, loading, error, actualizarUsuario, eliminarUsuario } =
    useUsuarioDetalle(id);

  const handleSave = useCallback(
    async (input: { nombre: string; email: string; rol: string; estado: string; cargo?: string }) => {
      setSaving(true);
      try {
        await actualizarUsuario(input);
      } finally {
        setSaving(false);
      }
    },
    [actualizarUsuario],
  );

  const handleDelete = useCallback(async () => {
    if (!usuario) {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await eliminarUsuario();
      router.push('/configuracion/usuarios');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo eliminar el usuario.';
      window.alert(message);
    } finally {
      setDeleting(false);
    }
  }, [eliminarUsuario, router, usuario]);

  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader title="Configuración / Usuarios" showSearch={false} />

      <UsuariosBackLink />

      {error && usuario && (
        <div
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {error}
        </div>
      )}

      <RequestState
        loading={loading}
        error={!usuario ? error : null}
        empty={!loading && !usuario}
        variant="detail"
        loadingMessage="Cargando detalle del usuario…"
        emptyMessage="Usuario no encontrado."
      >
        {usuario && (
          <div className="rounded-[2rem] border border-[#EBE2D5] bg-[#F7F4EF] p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
            <UsuarioDetalleHeader usuario={usuario} />

            <UsuarioInfoCard usuario={usuario} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <UsuarioStatCard label="Fecha ingreso" value={usuario.fechaIngreso} />
              <UsuarioStatCard label="Último acceso" value={usuario.ultimoAcceso} />
            </div>

            <section aria-labelledby="permisos-seguridad-title">
              <h2
                id="permisos-seguridad-title"
                className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4"
              >
                Permisos y seguridad
              </h2>
              <ul className="space-y-3" role="list" aria-label="Permisos del usuario">
                {usuario.permisos.map((permiso) => (
                  <PermisoRow key={permiso.id} permiso={permiso} />
                ))}
              </ul>
            </section>

            <UsuarioDetalleActions
              onEdit={() => setModalOpen(true)}
              onDelete={handleDelete}
              deleting={deleting}
            />
          </div>
        )}
      </RequestState>

      {!loading && !usuario && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/configuracion/usuarios')}
            className="text-sm font-semibold text-[#8B5E3C] hover:underline cursor-pointer"
          >
            Volver a la lista
          </button>
        </div>
      )}

      <EditarUsuarioModal
        isOpen={modalOpen}
        usuario={usuario}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
