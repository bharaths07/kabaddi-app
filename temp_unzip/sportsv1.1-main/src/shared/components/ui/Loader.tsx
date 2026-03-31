import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
}

export const Loader = ({ size = 'md', variant = 'primary', className, ...props }: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-text-secondary',
    white: 'text-white',
  };

  return (
    <div className={`flex justify-center items-center ${className || ''}`} {...props}>
      <Loader2 
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`} 
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
