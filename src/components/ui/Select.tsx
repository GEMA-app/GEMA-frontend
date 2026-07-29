'use client';

import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className = '',
  id,
  name,
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        name={name}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white dark:bg-gema-surface-dark border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-gema-accent focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed pr-9"
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40"
        strokeWidth={1.5}
      />
    </div>
  );
}
