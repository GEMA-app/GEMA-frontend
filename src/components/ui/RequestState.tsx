'use client';

import type { ReactNode } from 'react';

type RequestStateVariant = 'default' | 'detail';

interface RequestStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
  variant?: RequestStateVariant;
  onRetry?: () => void;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<RequestStateVariant, string> = {
  default: 'rounded-xl',
  detail: 'rounded-[2rem] border border-[#EBE2D5] bg-[#F7F4EF]',
};

export function RequestState({
  loading = false,
  error = null,
  empty = false,
  loadingMessage = 'Cargando…',
  emptyMessage = 'No hay datos para mostrar.',
  errorMessage,
  variant = 'default',
  onRetry,
  children,
}: RequestStateProps) {
  const shell = `${VARIANT_CLASSES[variant]} px-6 py-12 sm:py-16 text-center text-sm`;

  if (loading) {
    return (
      <div
        className={`${shell} bg-[#EBE2D5]/60 text-gray-600`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {loadingMessage}
      </div>
    );
  }

  if (error && empty) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage ?? error}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-3 underline underline-offset-2 hover:no-underline"
            >
              Reintentar
            </button>
          )}
        </div>
        <div className={`${shell} border border-dashed border-[#DED4C7] bg-white/50 text-gray-500`}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        role="alert"
      >
        {errorMessage ?? error}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-3 underline underline-offset-2 hover:no-underline"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={`${shell} border border-dashed border-[#DED4C7] bg-white/50 text-gray-500`}
        role="status"
      >
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
