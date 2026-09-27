import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PasswordInput = React.forwardRef(
  (
    {
      id,
      name,
      label,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      placeholder = '••••••••',
      disabled = false,
      className,
      leftIcon,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const inputId = id || name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'w-full bg-white border border-hairline text-text-primary rounded-xl px-4 py-2.5 pr-10 text-sm transition-all duration-150 placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              error && 'border-red-400 focus:ring-red-200 focus:border-red-500',
              className
            )}
            {...props}
          />

          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            disabled={disabled}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors disabled:cursor-not-allowed"
            aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
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

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
