import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = '',
  containerClassName = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-start gap-3 ${containerClassName}`}>
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="peer h-5 w-5 opacity-0 absolute z-10 cursor-pointer"
          {...props}
        />
        <div className={`
          h-5 w-5 rounded border bg-white flex items-center justify-center transition-all duration-200 pointer-events-none
          peer-focus:ring-2 peer-focus:ring-primary/20 peer-focus:border-primary
          peer-checked:bg-primary peer-checked:border-primary
          ${error ? 'border-red-500' : 'border-slate-300'}
          ${className}
        `}>
          <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" strokeWidth={3} />
        </div>
      </div>
      
      {label && (
        <label 
          htmlFor={checkboxId}
          className={`text-sm select-none cursor-pointer ${error ? 'text-red-500' : 'text-text-primary'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
