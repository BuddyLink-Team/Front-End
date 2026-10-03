import React from 'react';
import { cn } from '../../utils/cn';

export const Switch = React.forwardRef(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      label,
      description,
      size = 'md',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id || props.name || generatedId;

    const sizes = {
      sm: {
        track: 'w-8 h-4.5',
        thumb: 'w-3.5 h-3.5',
        translate: 'translate-x-3.5',
      },
      md: {
        track: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-7.5',
        thumb: 'w-6.5 h-6.5',
        translate: 'translate-x-6.5',
      },
    };

    const currentSize = sizes[size] || sizes.md;

    const handleToggle = (e) => {
      if (disabled) return;
      if (onChange) {
        onChange(!checked, e);
      }
    };

    return (
      <div className={cn('flex items-center justify-between gap-3 select-none', className)}>
        {(label || description) && (
          <div className="flex-1 text-left">
            {label && (
              <label
                htmlFor={switchId}
                className={cn(
                  'block text-sm font-medium text-text-primary cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-60'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  'text-xs text-text-muted mt-0.5',
                  disabled && 'opacity-60'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <button
          ref={ref}
          type="button"
          role="switch"
          id={switchId}
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2',
            checked ? 'bg-primary' : 'bg-gray-200',
            disabled && 'cursor-not-allowed opacity-50 bg-gray-200',
            currentSize.track
          )}
          {...props}
        >
          <span
            className={cn(
              'pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
              checked ? currentSize.translate : 'translate-x-0',
              currentSize.thumb
            )}
          />
        </button>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
