import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode | LucideIcon;
  endIcon?: React.ReactNode | LucideIcon;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  startIcon: StartIcon,
  endIcon: EndIcon,
  className = '',
  containerClassName = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  // Generate a unique ID if none provided, for accessibility
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isError = !!error;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Start Icon */}
        {StartIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 flex items-center justify-center">
            {React.isValidElement(StartIcon) ? (
              StartIcon
            ) : (
              React.createElement(StartIcon as React.ElementType, { size: 18 } as any)
            )}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-900 transition-all duration-200
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
            ${StartIcon ? 'pl-10' : 'px-4'}
            ${EndIcon ? 'pr-10' : 'px-4'}
            h-11 py-2
            ${isError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'hover:border-slate-400'
            }
            ${className}
          `}
          {...props}
        />

        {/* End Icon */}
        {EndIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 flex items-center justify-center">
            {React.isValidElement(EndIcon) ? (
              EndIcon
            ) : (
              React.createElement(EndIcon as React.ElementType, { size: 18 } as any)
            )}
          </div>
        )}
      </div>

      {/* Helper Text or Error Message */}
      {(error || helperText) && (
        <p className={`text-xs ${isError ? 'text-red-500' : 'text-text-secondary'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
