'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, User, Tag, Calendar, ShieldCheck, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { getUsuarioById } from '@/services/usuarios';
import type { Usuario } from '@/types/usuario';

function formatFecha(fecha: string): string {
  try {
    return new Date(fecha).toLocaleDateString('es-VE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return fecha; }
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-5 h-5 text-[#E5920C] mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function UsuarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); setError('ID no especificado.'); return; }
    let cancelled = false;
    (async () => {
      try {
        const u = await getUsuarioById(id);
        if (!cancelled) setUsuario(u);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader title="Usuarios / Detalle" variant="activos" />

      <div className="mb-6 flex items-center justify-between">
        <Link href="/usuarios" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </Link>
        {usuario && (
          <Link href={`/usuarios/${usuario.id}/editar`} className="flex items-center gap-2 px-4 py-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold rounded-xl text-sm transition-colors">
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Editar
          </Link>
        )}
      </div>

      <RequestState loading={loading} error={error} empty={!loading && !error && !usuario}
        loadingMessage="Cargando usuario..." emptyMessage="Usuario no encontrado.">
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalle del usuario</h2>
          <div className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100 divide-y divide-gray-100">
            <DetailRow icon={<User className="w-5 h-5" />} label="Nombre" value={usuario?.nombre || '—'} />
            <DetailRow icon={<Mail className="w-5 h-5" />} label="Email" value={usuario?.email || '—'} />
            <DetailRow icon={<Phone className="w-5 h-5" />} label="Teléfono" value={usuario?.telefono || '—'} />
            <DetailRow icon={<ShieldCheck className="w-5 h-5" />} label="Estado" value={usuario?.activo ? 'Activo' : 'Inactivo'} />
            <DetailRow icon={<Tag className="w-5 h-5" />} label="Roles" value={usuario?.roles.join(', ') || '—'} />
            <DetailRow icon={<Calendar className="w-5 h-5" />} label="Creado" value={usuario?.created_at ? formatFecha(usuario.created_at) : '—'} />
            <DetailRow icon={<Calendar className="w-5 h-5" />} label="Actualizado" value={usuario?.updated_at ? formatFecha(usuario.updated_at) : '—'} />
          </div>
        </div>
      </RequestState>
    </div>
  );
}
