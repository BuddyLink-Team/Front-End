import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { cn } from '../../../../utils/cn';

/**
 * KPI card with comparison against previous period.
 * When changePercent is null (e.g. previous was 0), displays "—" (no data).
 */
export const AdminKpiCard = ({
  title,
  value = '—',
  subtitle,
  changePercent = null,
  icon: Icon,
  variant = 'primary',
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <Skeleton className={cn('h-32 rounded-2xl', className)} />;
  }

  const variantStyles = {
    primary: {
      iconBg: 'bg-primary-soft text-primary-dark',
      border: 'border-hairline',
    },
    secondary: {
      iconBg: 'bg-secondary-soft text-secondary-dark',
      border: 'border-hairline',
    },
    accent: {
      iconBg: 'bg-tertiary-soft text-tertiary-dark',
      border: 'border-hairline',
    },
    warning: {
      iconBg: 'bg-tertiary-soft text-tertiary-dark',
      border: 'border-hairline',
    },
    info: {
      iconBg: 'bg-primary-soft text-primary-dark',
      border: 'border-hairline',
    },
  };

  const style = variantStyles[variant] || variantStyles.primary;

  const renderTrendBadge = () => {
    if (changePercent === null || changePercent === undefined) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded-full">
          <Minus className="w-3 h-3" />
          <span>Kỳ trước: 0</span>
        </span>
      );
    }

    if (changePercent > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark bg-primary-soft px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3 stroke-2.5" />
          <span>+{changePercent}%</span>
        </span>
      );
    }

    if (changePercent < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-error bg-error-container px-2 py-0.5 rounded-full">
          <TrendingDown className="w-3 h-3 stroke-2.5" />
          <span>{changePercent}%</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded-full">
        <span>0%</span>
      </span>
    );
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200',
        style.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-text-primary mt-1 tracking-tight truncate">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl shrink-0 flex items-center justify-center', style.iconBg)}>
            <Icon className="w-5 h-5 stroke-1.75" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 truncate">
          {renderTrendBadge()}
          <span className="text-text-muted truncate">so với kỳ trước</span>
        </div>
        {subtitle && (
          <span className="text-text-muted font-medium shrink-0">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default AdminKpiCard;
