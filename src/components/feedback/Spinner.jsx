import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable inline spinner indicator.
 *
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {string} [className]
 */
export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const borderThickness = size === 'lg' ? 'border-4' : 'border-2';

  return (
    <div className={cn('relative shrink-0', sizes[size] || sizes.md, className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-surface-container-high opacity-30',
          borderThickness
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full border-transparent border-t-primary animate-spin',
          borderThickness
        )}
      />
    </div>
  );
};

export default Spinner;
