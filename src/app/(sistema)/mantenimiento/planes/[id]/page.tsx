'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash, Calendar, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { getPlanById } from '@/services/planes-mantenimiento';
import type { PlanMantenimiento } from '@/types/plan-mantenimiento';

const TIPO_STYLES: Record<string, string> = {
  preventivo: 'bg-[#E3F2FD] text-[#1565C0]',
  correctivo: 'bg-[#FFF3E0] text-[#E65100]',
  predictivo: 'bg-[#F3E5F5] text-[#7B1FA2]',
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300">{value}</p>
    </div>
  );
}

function DetallePlanPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { eliminarPlan } = usePlanesMantenimiento();
  const { activos } = useActivos();
  const { usuarios } = useUsuarios();

  const [plan, setPlan] = useState<PlanMantenimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlanById(id)
      .then(setPlan)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar plan'))
      .finally(() => setLoading(false));
  }, [id]);

  const activoNombre = activos.find(a => a.id === plan?.activo_id)?.nombre ?? plan?.activo_id ?? '—';
  const tecnicoNombre = usuarios.find(u => u.id === plan?.tecnico_responsable_id)?.nombre ?? plan?.tecnico_responsable_id ?? '—';

  const handleDelete = async () => {
    if (!plan || !window.confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return;
    try {
      await eliminarPlan(plan.id);
      router.push('/mantenimiento/planes');
    } catch { alert('Error al eliminar el plan.'); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Detalle del plan de mantenimiento" />

      <div className="mb-6 flex items-center justify-between">
        <Link href="/mantenimiento/planes" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center gap-2">
          <PermissionGuard module="mantenimiento" action="edit">
            <Link href={`/mantenimiento/planes/${id}/editar`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-all">
              <Pencil className="w-4 h-4" />
              Editar
            </Link>
          </PermissionGuard>
          <PermissionGuard module="mantenimiento" action="delete">
            <button onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-full text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer">
              <Trash className="w-4 h-4" />
              Eliminar
            </button>
          </PermissionGuard>
        </div>
      </div>

      <RequestState loading={loading} error={error} empty={!loading && !error && !plan}
        loadingMessage="Cargando plan..." emptyMessage="Plan no encontrado."
      >
        {plan && (
          <>
            <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6"
              style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
              <div className="flex items-center justify-between border-b-2 border-[#2E4365]/20 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.nombre}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${TIPO_STYLES[plan.tipo] || ''}`}>
                    {plan.tipo}
                  </span>
                  {plan.es_urgente && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <AlertTriangle className="w-3 h-3" />
                      Urgente
                    </span>
                  )}
                  <span className={`inline-block w-3 h-3 rounded-full ${plan.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    title={plan.activo ? 'Activo' : 'Inactivo'} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailRow label="Activo" value={activoNombre} />
                <DetailRow label="Intervalo" value={`${plan.intervalo_dias} días`} />
                <DetailRow label="Próxima ejecución" value={plan.proxima_ejecucion} />
                <DetailRow label="Técnico responsable" value={tecnicoNombre} />
                <DetailRow label="Creado" value={plan.created_at ? new Date(plan.created_at).toLocaleDateString('es-VE') : '—'} />
                <DetailRow label="Actualizado" value={plan.updated_at ? new Date(plan.updated_at).toLocaleDateString('es-VE') : '—'} />
              </div>

              {plan.descripcion_tareas && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Descripción de tareas</label>
                  <p className="text-sm text-gray-700 py-1.5 border-b border-gray-300 whitespace-pre-wrap">{plan.descripcion_tareas}</p>
                </div>
              )}
            </div>

            {/* Ejecuciones */}
            <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-4 mt-8"
              style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
              <div className="border-b-2 border-[#2E4365]/20 pb-4">
                <div className="flex items-center gap-2 text-[#E59D12] font-semibold text-base">
                  <Calendar className="w-5 h-5" />
                  <span className="text-gray-800">Ejecuciones</span>
                </div>
              </div>

              {plan.ejecuciones.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Sin ejecuciones registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/50 text-gray-600 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                        <th className="text-left px-4 py-3 font-semibold">OT</th>
                        <th className="text-left px-4 py-3 font-semibold">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plan.ejecuciones.map((eje) => (
                        <tr key={eje.id} className="hover:bg-white/50 transition-colors">
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(eje.execution_date).toLocaleDateString('es-VE')}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/mantenimiento/${eje.work_order_id}`}
                              className="text-[#E59D12] hover:underline font-medium">
                              {eje.work_order_id.slice(0, 8)}...
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{eje.observations || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </RequestState>
    </div>
  );
}

export default function DetallePlanPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <DetallePlanPageContent />
    </AuthGuard>
  );
}