import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        card overflow-hidden
        ${hoverable || onClick ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
