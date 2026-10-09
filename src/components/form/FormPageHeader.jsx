import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/**
 * Header of a form page: back button, title, one-line description and optional actions on the right
 */
export const FormPageHeader = ({
  title,
  badge,
  description,
  onBack,
  backLabel = 'Quay lại',
  actions,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            aria-label={backLabel}
            className="rounded-xl border border-hairline hover:bg-surface-container-lowest shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
            {badge}
          </div>
          {description && <p className="text-sm text-text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="shrink-0 self-start">{actions}</div>}
    </div>
  );
};

export default FormPageHeader;
