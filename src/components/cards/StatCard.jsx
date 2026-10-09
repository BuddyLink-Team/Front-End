import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * StatCard – dashboard metric container with icon and trend badge.
 *
 * @param {React.ReactNode} icon
 * @param {string} title
 * @param {string|number} value
 * @param {string} [change] – e.g. '+12%' or '-5%'
 * @param {string} [changeSuffix='so với tháng trước']
 * @param {'primary'|'secondary'|'tertiary'|'error'} [variant='primary']
 */
export const StatCard = ({
  icon,
  title = 'Chỉ số',
  value = '—',
  change = '',
  changeSuffix = 'so với tháng trước',
  variant = 'primary',
  className,
}) => {
  const variantMap = {
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary-dark',
    },
    secondary: {
      bg: 'bg-secondary/20',
      text: 'text-secondary-dark',
    },
    tertiary: {
      bg: 'bg-tertiary/20',
      text: 'text-tertiary-dark',
    },
    error: {
      bg: 'bg-error-container/40',
      text: 'text-error',
    },
  };

  const current = variantMap[variant] || variantMap.primary;
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-hairline p-6 flex items-center gap-4 shadow-xs hover:shadow-sm transition-all duration-200',
        className
      )}
    >
      {/* Icon Badge */}
      {icon && (
        <div
          className={cn(
            'p-3.5 rounded-2xl shrink-0 flex items-center justify-center',
            current.bg,
            current.text
          )}
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted truncate">
          {title}
        </p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>

        {change && (
          <p
            className={cn(
              'text-xs font-medium mt-1 flex items-center gap-1',
              isPositive && 'text-primary-dark',
              isNegative && 'text-error',
              !isPositive && !isNegative && 'text-text-muted'
            )}
          >
            {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
            {changeSuffix && (
              <span className="text-text-muted">{changeSuffix}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
