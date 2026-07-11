import type { ReporteFiltroTipo } from '@/types/reporte';

const TABS: { id: ReporteFiltroTipo; label: string }[] = [
  { id: 'todos', label: 'TODOS LOS REPORTES' },
  { id: 'correctivo', label: 'CORRECTIVOS' },
  { id: 'preventivo', label: 'PREVENTIVOS' },
];

interface ReporteFilterTabsProps {
  value: ReporteFiltroTipo;
  onChange: (value: ReporteFiltroTipo) => void;
}

export function ReporteFilterTabs({ value, onChange }: ReporteFilterTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2 sm:gap-3"
      role="tablist"
      aria-label="Filtrar reportes por tipo"
    >
      {TABS.map((tab) => {
        const isActive = value === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-reportes-${tab.id}`}
            aria-selected={isActive}
            aria-controls="reportes-panel"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-2 text-[10px] sm:text-xs font-bold tracking-wide border transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#E5A93D] text-black border-[#E5A93D]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
