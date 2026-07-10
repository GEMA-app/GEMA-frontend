'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';

export default function UbicacionesPlaceholderPage() {
  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader title="Configuración / Ubicaciones" searchLabel="Buscar ubicaciones" />
      <ConfigBackLink />

      <div className="rounded-[2rem] border border-[#EBE2D5] bg-[#F7F4EF] p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ubicaciones</h2>
        <p className="text-sm text-gray-600">Vista en desarrollo — disponible en una fase posterior.</p>
      </div>
    </div>
  );
}
