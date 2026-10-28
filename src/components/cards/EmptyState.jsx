import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        // Solid white + stronger dashed outline so it stands out from the canvas
        'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-hairline-strong rounded-2xl bg-surface-container-lowest shadow-xs',
        className,
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-primary-soft border border-primary-border flex items-center justify-center text-primary-dark mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
