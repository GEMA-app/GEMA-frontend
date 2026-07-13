'use client';

import { useId } from 'react';
import { Search } from 'lucide-react';

interface LocalSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function LocalSearchInput({
  value,
  onChange,
  placeholder = 'Buscar',
  label = 'Buscar en la lista',
  className = '',
}: LocalSearchInputProps) {
  const inputId = useId();

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" aria-hidden />
      </div>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DED4C7] rounded-xl text-sm focus:ring-2 focus:ring-[#ECA03C] outline-none text-gray-700"
      />
    </div>
  );
}
