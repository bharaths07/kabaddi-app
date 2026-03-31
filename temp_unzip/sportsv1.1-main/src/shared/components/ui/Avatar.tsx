import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-base',
      xl: 'h-20 w-20 text-lg',
    };

    const [imageError, setImageError] = React.useState(false);

    const baseClasses = `relative flex shrink-0 overflow-hidden rounded-full ${sizeClasses[size]} ${className || ''}`;

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-text-secondary font-medium uppercase">
            {fallback ? (
              typeof fallback === 'string' ? fallback.slice(0, 2) : fallback
            ) : (
              <User className="h-[50%] w-[50%]" />
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
