'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import PlanForm from '@/components/planes/PlanForm';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { getPlanById } from '@/services/planes-mantenimiento';
import type { PlanMantenimiento, ActualizarPlanInput } from '@/types/plan-mantenimiento';

function EditarPlanPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { editarPlan } = usePlanesMantenimiento();
  const { activos } = useActivos();
  const { usuarios } = useUsuarios();
  const tecnicos = usuarios.filter(u => u.roles.some(r =>
    r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('tecnico')
  ));

  const [plan, setPlan] = useState<PlanMantenimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlanById(id)
      .then(p => { setPlan(p); })
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar plan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async (data: ActualizarPlanInput) => {
    await editarPlan(id, data);
    router.push('/mantenimiento/planes');
  }, [id, editarPlan, router]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Editar plan de mantenimiento" />
      <div className="mb-6">
        <Link href={`/mantenimiento/planes/${id}`} className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
      </div>

      <RequestState loading={loading} error={error} empty={!loading && !error && !plan}
        loadingMessage="Cargando plan..." emptyMessage="Plan no encontrado."
      >
        {plan && (
          <PlanForm
            activos={activos.map(a => ({ id: a.id, nombre: a.nombre }))}
            tecnicos={tecnicos.map(u => ({ id: u.id, nombre: u.nombre, email: u.email }))}
            initialValues={{
              activo_id: plan.activo_id,
              nombre: plan.nombre,
              tipo: plan.tipo,
              intervalo_dias: String(plan.intervalo_dias),
              proxima_ejecucion: plan.proxima_ejecucion,
              tecnico_responsable_id: plan.tecnico_responsable_id ?? '',
              descripcion_tareas: plan.descripcion_tareas ?? '',
              activo: plan.activo,
            }}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
            isEditing
          />
        )}
      </RequestState>
    </div>
  );
}

export default function EditarPlanPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico']}>
      <EditarPlanPageContent />
    </AuthGuard>
  );
}
