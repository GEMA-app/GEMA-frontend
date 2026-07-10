import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ConfigBackLink() {
  return (
    <div className="mb-6">
      <Link
        href="/configuracion"
        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold gap-2 cursor-pointer"
      >
        <ArrowLeft size={16} strokeWidth={2.5} aria-hidden />
        Volver a configuración
      </Link>
    </div>
  );
}
