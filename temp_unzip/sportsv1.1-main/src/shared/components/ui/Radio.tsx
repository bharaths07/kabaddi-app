import React, { forwardRef } from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  error,
  className = '',
  containerClassName = '',
  id,
  ...props
}, ref) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-start gap-3 ${containerClassName}`}>
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className="peer h-5 w-5 opacity-0 absolute z-10 cursor-pointer"
          {...props}
        />
        <div className={`
          h-5 w-5 rounded-full border bg-bg-input flex items-center justify-center transition-all duration-200 pointer-events-none
          peer-focus:ring-2 peer-focus:ring-primary/20 peer-focus:border-primary
          peer-checked:border-primary
          ${error ? 'border-red-500' : 'border-border'}
          ${className}
        `}>
          <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-all duration-200 scale-0 peer-checked:scale-100" />
        </div>
      </div>
      
      {label && (
        <label 
          htmlFor={radioId}
          className={`text-sm select-none cursor-pointer ${error ? 'text-red-500' : 'text-text-primary'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';
