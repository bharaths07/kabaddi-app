import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: (e: React.MouseEvent) => void;
  icon?: React.ReactNode | string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  description,
  actionLabel, 
  actionLink, 
  onAction,
  icon
}) => {
  const renderIcon = () => {
    if (!icon) return <Inbox size={48} className="text-text-muted opacity-50" />;
    if (typeof icon === 'string') return <span className="text-5xl opacity-80">{icon}</span>;
    return <div className="text-text-muted opacity-80">{icon}</div>;
  };

  return (
    <Card className="flex flex-col items-center justify-center text-center">
      <div className="mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      <div className="mt-2">
        {actionLabel && actionLink && (
          <Link to={actionLink}>
            <Button variant="primary">
              {actionLabel}
            </Button>
          </Link>
        )}

        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};
