import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Select = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = 'Chọn một tùy chọn...',
      className,
      disabled = false,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || React.useId();

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full appearance-none bg-white border border-hairline text-text-primary rounded-xl px-4 py-2.5 pr-10 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer',
              error && 'border-red-400 focus:ring-red-200 focus:border-red-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {children
              ? children
              : options.map((opt) => {
                  const val = typeof opt === 'object' ? opt.value : opt;
                  const text = typeof opt === 'object' ? opt.label : opt;
                  return (
                    <option key={val} value={val}>
                      {text}
                    </option>
                  );
                })}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
