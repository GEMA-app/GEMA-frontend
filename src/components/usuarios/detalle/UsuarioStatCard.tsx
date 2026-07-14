interface UsuarioStatCardProps {
  label: string;
  value: string;
}

export function UsuarioStatCard({ label, value }: UsuarioStatCardProps) {
  return (
    <div className="rounded-2xl border border-[#DED4C7] bg-[#F7F4EF] px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</p>
      <p className="text-base sm:text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
