import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ 
  label, 
  options, 
  error,
  helperText,
  className = '',
  containerClassName = '',
  id,
  ...props 
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const isError = !!error;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            appearance-none w-full bg-bg-input border text-text-primary py-2.5 pl-3 pr-10 rounded-lg text-sm transition-all cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary/20
            ${isError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-border focus:border-primary'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" 
          size={16} 
        />
      </div>

      {(error || helperText) && (
        <p className={`text-xs ${isError ? 'text-red-500' : 'text-text-secondary'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
