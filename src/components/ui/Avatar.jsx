import React from 'react';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/formatters';

export const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  isOnline,
  className,
  fallbackText,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
  };
  // Unknown sizes fall back to md so the initials circle always has a fixed box
  const sizeClass = sizes[size] || sizes.md;

  const statusDotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'rounded-full object-cover border-2 border-white shadow-sm',
            sizeClass
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-secondary-container text-secondary-on-container flex items-center justify-center font-semibold border-2 border-white shadow-sm',
            sizeClass
          )}
        >
          {fallbackText || getInitials(alt)}
        </div>
      )}

      {typeof isOnline === 'boolean' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusDotSizes[size] || statusDotSizes.md,
            isOnline ? 'bg-primary' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};
