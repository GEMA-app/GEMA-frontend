import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ReportesBackLink({ className = 'mb-6' }: { className?: string }) {
  return (
    <div className={className}>
      <Link
        href="/dashboard"
        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold gap-2 cursor-pointer"
      >
        <ArrowLeft size={16} strokeWidth={2.5} aria-hidden />
        Volver al inicio
      </Link>
    </div>
  );
}
