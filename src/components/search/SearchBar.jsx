import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * @param {string} value
 * @param {Function} onChange - Receives the new text
 * @param {Function} [onSearch] - Called on Enter
 * @param {Function} [onClear] - When given, a clear button shows while there is text
 * @param {string} [placeholder]
 * @param {string} [className]
 */
export const SearchBar = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Tìm bạn chơi, khu vực, trường học...',
  className,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  const showClear = Boolean(onClear && value);

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full bg-white border border-hairline text-text-primary rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all duration-150 placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary shadow-xs',
          showClear && 'pr-9'
        )}
      />
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Xoá tìm kiếm"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
};
