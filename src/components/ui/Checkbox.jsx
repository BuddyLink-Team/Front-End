import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Checkbox = React.forwardRef(
  (
    {
      label,
      description,
      error,
      checked,
      onChange,
      disabled = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Hooks must run unconditionally on every render
    const generatedId = React.useId();
    const checkboxId = id || props.name || generatedId;

    const inputProps = {
      ref,
      type: 'checkbox',
      id: checkboxId,
      disabled,
      className: 'peer sr-only',
      ...props,
    };

    if (checked !== undefined) {
      inputProps.checked = checked;
    }
    if (onChange !== undefined) {
      inputProps.onChange = onChange;
    }

    return (
      <div className={cn('flex items-start gap-2.5 text-left select-none', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input {...inputProps} />
          <label
            htmlFor={checkboxId}
            className={cn(
              'w-5 h-5 rounded-md border border-hairline bg-white flex items-center justify-center transition-all duration-150 cursor-pointer shadow-2xs',
              'hover:border-primary/50',
              'peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/25 peer-focus-visible:ring-offset-1',
              disabled && 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60 peer-checked:bg-gray-400 peer-checked:border-gray-400',
              error && 'border-red-400 peer-checked:bg-red-500'
            )}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </label>
        </div>

        {(label || description) && (
          <label
            htmlFor={checkboxId}
            className={cn(
              'cursor-pointer text-sm',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {label && (
              <span className="font-medium text-text-primary block leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-text-muted block mt-0.5 leading-normal">
                {description}
              </span>
            )}
            {error && <span className="text-xs text-red-500 block mt-1">{error}</span>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
