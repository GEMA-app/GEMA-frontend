'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type ReportData = {
  equipoNombre: string;
  tipoServicio: string;
  codigoInventario: string;
  referenciasFalla: string;
  resumenActividades: string;
  fechaApertura: string;
  fechaCierre: string;
  tecnicoResponsable: string;
  supervisorResponsable: string;
  costoTotal: string;
};

const initialReport: ReportData = {
  equipoNombre: '',
  tipoServicio: '',
  codigoInventario: '',
  referenciasFalla: '',
  resumenActividades: '',
  fechaApertura: '',
  fechaCierre: '',
  tecnicoResponsable: '',
  supervisorResponsable: '',
  costoTotal: '',
};

export default function MantenimientoOrdenPage() {
  const [report] = useState<ReportData>(initialReport);

  return (
    <main className="min-h-screen overflow-y-auto bg-[#ffffff] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-[#f2f2f3] p-8 shadow-sm">
          <Link href="/mantenimiento" className="mb-4 inline-flex items-center text-sm font-semibold text-[#2A5494] hover:underline">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Volver a mantenimiento
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-wide text-[#2A5494]">
            INFORME DE MANTENIMIENTO
          </h1>

          <div className="mt-8 overflow-hidden rounded-none border border-[#807C7C] bg-[#FFFFFF] p-6">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4">
              <div className="space-y-3">
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-semibold text-[#000000]">Nombre del equipo:</p>
                </div>
                <p className="text-base font-semibold text-[#000000]">{report.equipoNombre}</p>
              </div>
              <div className="space-y-3">
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-semibold text-[#000000]">Tipo de servicio:</p>
                </div>
                <p className="text-base font-semibold text-[#000000]">{report.tipoServicio}</p>
              </div>
              <div className="space-y-3">
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-semibold text-[#000000]">Código de inventario:</p>
                </div>
                <p className="text-base font-semibold text-[#000000]">{report.codigoInventario}</p>
              </div>
              <div className="space-y-3">
                <div className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-semibold text-[#000000]">Referencias de falla:</p>
                </div>
                <p className="text-base font-semibold text-[#000000]">{report.referenciasFalla}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-none border border-[#807C7C] bg-[#f2f2f3]">
            <div className="bg-[#2E4365] px-6 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
              RESUMEN DE ACTIVIDADES REALIZADAS
            </div>
            <div className="bg-[#f2f2f3] px-6 py-18 border-t border-[#807C7C] text-[#000000] text-justify leading-7">
              {report.resumenActividades}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-none border border-[#807C7C] bg-[#F2F2F3]">
              <div className="bg-[#2E4365] px-6 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
                REGISTRO CRONOLÓGICO
              </div>
              <div className="bg-[#F2F2F3] px-6 py-6 text-[#000000]">
                <div className="space-y-6">
                  <div>

                    <p className="text-xs uppercase tracking-[0.24em] text-[#000000]">Apertura de orden</p>
                    <p className="mt-2 text-base font-semibold">{report.fechaApertura}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#000000]">Cierre de orden</p>
                    <p className="mt-2 text-base font-semibold">{report.fechaCierre}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-none border border-[#807C7C] bg-[#F2F2F3]">
              <div className="bg-[#2E4365] px-6 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
                RESUMEN ECONÓMICO
              </div>
              <div className="bg-[#F2F2F3] px-6 py-6 text-[#000000]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#000000]">Costo total de intervención</p>
                <p className="mt-2 text-2xl font-black text-[#000000]">{report.costoTotal}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div className="text-center text-[#000000]">
              <div className="mx-auto mb-4 h-24 w-60 border-b border-[#000000]" />
              <p className="text-sm font-bold uppercase">{report.tecnicoResponsable}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em]">Técnico principal</p>
            </div>
            <div className="text-center text-[#000000]">
              <div className="mx-auto mb-4 h-24 w-60 border-b border-[#000000]" />
              <p className="text-sm font-bold uppercase">{report.supervisorResponsable}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em]">Supervisor de planta</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3D58D] text-[#2E4365] shadow-[0_10px_30px_rgba(243,213,141,0.25)]" aria-label="Imprimir">
              <Image src="/Impresion.svg" alt="Imprimir" width={24} height={24} />
            </button>
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E59D2C] text-[#F3D58D] shadow-[0_10px_30px_rgba(229,157,44,0.25)]" aria-label="Descargar">
              <Image src="/descarga.svg" alt="Descargar" width={24} height={24} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
