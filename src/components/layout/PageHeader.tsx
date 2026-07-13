'use client';

import { useId } from 'react';
import { Search, Bell, User } from 'lucide-react';

type PageHeaderVariant = 'configuracion' | 'activos';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: PageHeaderVariant;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  showSearch?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<
  PageHeaderVariant,
  { input: string; iconButton: string; iconColor: string }
> = {
  configuracion: {
    input: 'bg-[#F8F6F4] border-none text-gray-700',
    iconButton: 'border border-gray-200 bg-white shadow-sm',
    iconColor: 'text-[#8B5E3C]',
  },
  activos: {
    input: 'bg-white border border-gray-200 text-gray-700',
    iconButton: 'border border-gray-200 bg-white',
    iconColor: 'text-gray-600',
  },
};

export function PageHeader({
  title,
  subtitle,
  variant = 'configuracion',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar',
  searchLabel = 'Buscar en la página',
  showSearch = true,
  className = 'mb-6',
}: PageHeaderProps) {
  const searchId = useId();
  const styles = VARIANT_STYLES[variant];
  const isControlled = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <header className={`flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start ${className}`}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
        {showSearch && (
          <div className="relative flex-1 lg:flex-none lg:min-w-[16rem]">
            <label htmlFor={searchId} className="sr-only">
              {searchLabel}
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden />
            </div>
            <input
              id={searchId}
              type="search"
              value={isControlled ? searchValue : undefined}
              onChange={isControlled ? (event) => onSearchChange(event.target.value) : undefined}
              placeholder={searchPlaceholder}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-[#ECA03C] outline-none ${styles.input}`}
            />
          </div>
        )}
        <button
          type="button"
          className={`p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer ${styles.iconButton}`}
          aria-label="Notificaciones"
        >
          <Bell className={`w-6 h-6 ${styles.iconColor}`} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={`p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer ${styles.iconButton}`}
          aria-label="Perfil de usuario"
        >
          <User className={`w-6 h-6 ${styles.iconColor}`} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
