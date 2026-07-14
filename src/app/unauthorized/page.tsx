import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#ECEAE6] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-white border border-[#EBE2D5] p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={28} aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h1>
        <p className="text-gray-600 text-sm mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl bg-[#E5A93D] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#d19730] transition-colors"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
