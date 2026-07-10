'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';

export default function HistorialPlaceholderPage() {
  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader title="Configuración / Historial" searchLabel="Buscar en historial" />
      <ConfigBackLink />

      <div className="rounded-[2rem] border border-[#EBE2D5] bg-[#F7F4EF] p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Historial de usuarios</h2>
        <p className="text-sm text-gray-600">Vista en desarrollo — disponible en una fase posterior.</p>
      </div>
    </div>
  );
}
