import React from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
        <select
          ref={ref}
          className={clsx(
            'w-full bg-[#111622] border border-[#1e2738] rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors',
            error && 'border-rose-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111622] text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
