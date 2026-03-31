import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  isLoading = false, 
  loadingText = 'Loading...', 
  children, 
  variant = 'primary',
  style,
  disabled,
  ...props 
}) => {
  return (
    <button 
      disabled={isLoading || disabled} 
      className={`px-6 py-3 rounded-lg text-base font-bold w-full flex items-center justify-center gap-2 transition-all ${
        isLoading || disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
      } ${
        variant === 'secondary'
          ? 'bg-white/10 text-text-primary'
          : variant === 'danger'
          ? '[background-color:var(--color-neon-orange)] text-white'
          : '[background-color:var(--color-neon-cyan)] text-black'
      }`}
      style={style}
      {...props}
    >
      {isLoading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      )}
      {isLoading ? loadingText : children}
    </button>
  );
};
