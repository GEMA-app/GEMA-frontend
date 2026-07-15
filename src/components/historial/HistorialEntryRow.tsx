import type { HistorialEntry } from '@/types/historial';
import { formatFechaAbsoluta } from '@/lib/formatRelativeTime';
import { AccionBadge } from './AccionBadge';
import { RelativeTime } from './RelativeTime';

interface HistorialEntryRowProps {
  entry: HistorialEntry;
}

export function HistorialEntryRow({ entry }: HistorialEntryRowProps) {
  return (
    <article className="bg-[#EBE2D5] rounded-xl px-6 py-5 border border-[#DED4C7]/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        <div className="lg:col-span-3">
          <h3 className="font-bold text-gray-800 text-base leading-tight">
            {entry.usuario.nombre}
          </h3>
        </div>

        <div className="lg:col-span-6">
          <AccionBadge accion={entry.accion} />
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {entry.accion.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-2">
          <RelativeTime fecha={entry.fecha} />
          <time
            dateTime={entry.fecha}
            className="text-xs font-medium text-gray-500 whitespace-nowrap"
          >
            {formatFechaAbsoluta(entry.fecha)}
          </time>
        </div>
      </div>
    </article>
  );
}
