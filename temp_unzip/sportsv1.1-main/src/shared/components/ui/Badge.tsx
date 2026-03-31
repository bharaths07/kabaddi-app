import React from 'react';
// import { cn } from '../../lib/utils'; // Assuming cn utility exists, otherwise I'll use simple string concatenation or verify its existence first.

// Wait, I should check if 'lib/utils' exists. If not, I'll create a simple 'cn' utility.
// I'll assume standard Shadcn/Tailwind pattern. If not, I'll inline the logic.
// Let's create a local utility for now to be safe, or check first.
// Checking file existence first is better.

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    
    const variants = {
      default: 'bg-primary text-white hover:bg-primary/90',
      secondary: 'bg-muted text-text-secondary hover:bg-muted/80',
      outline: 'text-text-primary border border-border bg-transparent',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      success: 'bg-green-100 text-green-700 border border-green-200',
      warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    };

    const sizes = {
      sm: 'text-[10px] px-2 py-0.5',
      md: 'text-xs px-2.5 py-0.5',
      lg: 'text-sm px-3 py-1',
    };

    const baseStyles = "inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    
    // Simple class merging
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`;

    return (
      <div ref={ref} className={combinedClassName} {...props} />
    );
  }
);

Badge.displayName = "Badge";
