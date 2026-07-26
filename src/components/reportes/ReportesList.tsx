import type { Reporte, ReporteEstado } from '@/types/reporte';
import { ReporteRow } from './ReporteRow';

interface ReportesListProps {
  reportes: Reporte[];
  onEdit: (reporte: Reporte) => void;
  onDelete: (id: string) => void;
  onTransition: (id: string, status: ReporteEstado, version: number) => Promise<void>;
}

export function ReportesList({ reportes, onEdit, onDelete, onTransition }: ReportesListProps) {
  if (reportes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#DED4C7] bg-white/50 px-6 py-12 text-center text-sm text-gray-500">
        No se encontraron reportes con los filtros actuales.
      </div>
    );
  }

  return (
    <div role="region" aria-label="Lista de reportes de falla">
      <div
        className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-600"
        aria-hidden
      >
        <div className="col-span-3">Reporte</div>
        <div className="col-span-2">Prioridad</div>
        <div className="col-span-2">Estado</div>
        <div className="col-span-2 text-right">Reportado por</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      <div className="space-y-3" role="list">
        {reportes.map((reporte) => (
          <div key={reporte.id} role="listitem">
            <ReporteRow
              reporte={reporte}
              onEdit={onEdit}
              onDelete={onDelete}
              onTransition={onTransition}
            />
          </div>
        ))}
      </div>
    </div>
  );
}