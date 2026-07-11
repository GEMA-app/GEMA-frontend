interface ReportesStatCardProps {
  label: string;
  value: number;
}

export function ReportesStatCard({ label, value }: ReportesStatCardProps) {
  return (
    <div className="rounded-2xl border border-[#DED4C7] bg-[#EAE1D0] px-5 py-5 sm:px-6 sm:py-6 shadow-sm">
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
