import type { ReactNode } from 'react';

interface RequestStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function RequestState({
  loading,
  error,
  empty,
  loadingMessage = 'Cargando...',
  emptyMessage = 'No hay datos para mostrar.',
  onRetry,
  children,
}: RequestStateProps) {
  if (loading) {
    return (
      <div className="bg-[#EBE2D5] rounded-xl px-6 py-10 text-center text-gray-600 text-sm border border-[#DED4C7]/50">
        {loadingMessage}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FDE8E8] rounded-xl px-6 py-8 text-center border border-[#EF9A9A]/60">
        <p className="text-sm text-[#C62828] font-medium">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 px-4 py-2 rounded-xl bg-white border border-[#EF9A9A] text-sm font-semibold text-[#C62828] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="bg-[#EBE2D5] rounded-xl px-6 py-10 text-center text-gray-600 text-sm border border-[#DED4C7]/50">
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
