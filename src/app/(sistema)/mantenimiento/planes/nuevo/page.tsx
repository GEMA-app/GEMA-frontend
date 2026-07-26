'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuthGuard } from '@/components/auth/AuthGuard';
import PlanForm from '@/components/planes/PlanForm';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import { useUsuarios } from '@/hooks/useUsuarios';
import type { NuevoPlanInput, ActualizarPlanInput } from '@/types/plan-mantenimiento';

function NuevoPlanPageContent() {
  const router = useRouter();
  const { crearPlan } = usePlanesMantenimiento();
  const { activos } = useActivos();
  const { usuarios } = useUsuarios();
  const tecnicos = usuarios.filter(u => u.roles.some(r =>
    r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('tecnico')
  ));

  const handleSubmit = useCallback(async (data: NuevoPlanInput | ActualizarPlanInput) => {
    await crearPlan(data as NuevoPlanInput);
    router.push('/mantenimiento/planes');
  }, [crearPlan, router]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Nuevo plan de mantenimiento" />
      <div className="mb-6">
        <Link href="/mantenimiento/planes" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>
      <PlanForm
        activos={activos.map(a => ({ id: a.id, nombre: a.nombre }))}
        tecnicos={tecnicos.map(u => ({ id: u.id, nombre: u.nombre, email: u.email }))}
        onSubmit={handleSubmit}
        submitLabel="Crear plan"
      />
    </div>
  );
}

export default function NuevoPlanPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico']}>
      <NuevoPlanPageContent />
    </AuthGuard>
  );
}
