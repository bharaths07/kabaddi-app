import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const isError = !!error;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={textareaId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={`
          w-full bg-bg-input border rounded-lg text-sm text-text-primary transition-all duration-200
          placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-primary/20
          px-3 py-2.5
          min-h-[80px]
          ${isError 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-border focus:border-primary'
          }
          ${className}
        `}
        {...props}
      />

      {(error || helperText) && (
        <p className={`text-xs ${isError ? 'text-red-500' : 'text-text-secondary'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
