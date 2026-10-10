import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Tabs component - Pill-style or Line-style tab bar.
 * Supports icons, counters/badges, and smooth transitions.
 *
 * @param {Array<{id: string, label: string, icon?: React.ComponentType, count?: number}>} tabs
 * @param {string} activeTab
 * @param {Function} onChange
 * @param {'pill'|'line'} [variant='pill']
 * @param {boolean} [fullWidth=false] - Pill variant: stretch the bar and split it evenly between tabs
 */
export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pill',
  fullWidth = false,
  className,
}) => {
  if (variant === 'line') {
    return (
      <div className={cn('flex items-center gap-6 border-b border-hairline', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={cn(
                'flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-all duration-150 select-none -mb-px',
                isActive
                  ? 'border-primary text-primary-dark font-semibold'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-hairline'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              {typeof tab.count !== 'undefined' && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-semibold',
                    isActive
                      ? 'bg-primary/15 text-primary-dark'
                      : 'bg-gray-100 text-text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default 'pill' variant
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 bg-surface-muted rounded-full border border-hairline overflow-x-auto max-w-full',
        fullWidth && 'flex w-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            aria-pressed={isActive}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 select-none whitespace-nowrap',
              fullWidth && 'flex-1 justify-center',
              isActive
                ? 'bg-primary text-white shadow-xs font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-white/60'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {typeof tab.count !== 'undefined' && (
              <span
                className={cn(
                  'text-xs px-2 py-0.2 rounded-full font-semibold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-text-muted border border-hairline'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
