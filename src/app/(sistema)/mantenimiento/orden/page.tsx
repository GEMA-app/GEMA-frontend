'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

import { AuthGuard } from '@/components/auth/AuthGuard';

function MantenimientoOrdenPageContent() {
  const [report, setReport] = useState<ReportData>(initialReport);
  const [loaded, setLoaded] = useState(false);
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoaded(true);
      return;
    }

    const stored = window.localStorage.getItem('gemaOrdenReporte');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ReportData;
        setReport(parsed);
        setHasReport(true);
      } catch {
        setHasReport(false);
      }
    }

    setLoaded(true);
  }, []);

  const handleDownload = async () => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 40;
    const maxWidth = 612 - margin * 2;
    const lineHeight = 20;
    let y = 760;

    const splitTextIntoLines = (text: string, font: any, size: number) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, size);

        if (width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;

          if (font.widthOfTextAtSize(word, size) > maxWidth) {
            let partial = '';
            for (const char of word) {
              const next = partial + char;
              if (font.widthOfTextAtSize(next, size) > maxWidth) {
                lines.push(partial);
                partial = char;
              } else {
                partial = next;
              }
            }
            currentLine = partial;
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    const drawBlock = (text: string, options: { font?: any; size?: number; color?: any; spacing?: number } = {}) => {
      const actualFont = options.font ?? font;
      const actualSize = options.size ?? 12;
      const lines = splitTextIntoLines(text, actualFont, actualSize);

      for (const line of lines) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([612, 792]);
          y = 760;
        }
        page.drawText(line, {
          x: margin,
          y,
          size: actualSize,
          font: actualFont,
          color: options.color ?? rgb(0, 0, 0),
        });
        y -= lineHeight;
      }

      y -= options.spacing ?? 8;
    };

    drawBlock('INFORME DE MANTENIMIENTO', { font: fontBold, size: 16, spacing: 14 });
    drawBlock(`Nombre del equipo: ${report.equipoNombre}`);
    drawBlock(`Tipo de servicio: ${report.tipoServicio}`);
    drawBlock(`Código de inventario: ${report.codigoInventario}`);
    drawBlock(`Referencias de falla: ${report.referenciasFalla}`);
    drawBlock('RESUMEN DE ACTIVIDADES REALIZADAS', { font: fontBold, size: 13, spacing: 10 });
    drawBlock(report.resumenActividades);
    drawBlock('REGISTRO CRONOLÓGICO', { font: fontBold, size: 13, spacing: 10 });
    drawBlock(`Apertura de orden: ${report.fechaApertura}`);
    drawBlock(`Cierre de orden: ${report.fechaCierre}`);
    drawBlock('RESUMEN ECONÓMICO', { font: fontBold, size: 13, spacing: 10 });
    drawBlock(`Costo total de intervención: ${report.costoTotal}`);
    drawBlock(`Técnico principal: ${report.tecnicoResponsable}`);
    drawBlock(`Supervisor de planta: ${report.supervisorResponsable}`);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([Uint8Array.from(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-mantenimiento-${report.equipoNombre || 'orden'}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!loaded) {
    return null;
  }

  /* no hay información de orden disponible */
  if (!hasReport) {
    return (
      <main className="min-h-screen overflow-y-auto bg-[#ffffff] px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-[#f2f2f3] p-8 shadow-sm">
            <p className="text-base text-[#000000]">No hay información de orden disponible. Crea una orden en la vista de calendario para ver el informe.</p>
            <Link href="/mantenimiento/calendario" className="mt-6 inline-flex rounded-xl bg-[#E59D2C] px-5 py-3 text-sm font-semibold text-[#000000] shadow-sm hover:bg-[#d4912f]">
              Volver al calendario
            </Link>
          </div>
        </div>
      </main>
    );
  }


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
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3D58D] text-[#2E4365] shadow-[0_10px_30px_rgba(243,213,141,0.25)]"
              aria-label="Imprimir"
            >
              <Image src="/Impresion.svg" alt="Imprimir" width={24} height={24} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E59D2C] text-[#F3D58F] shadow-[0_10px_30px_rgba(229,157,44,0.25)]"
              aria-label="Descargar"
            >
              <Image src="/descarga.svg" alt="Descargar" width={24} height={24} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MantenimientoOrdenPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <MantenimientoOrdenPageContent />
    </AuthGuard>
  );
}

