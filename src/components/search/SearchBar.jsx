import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm bạn chơi, khu vực, trường học...',
  className,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

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
        className="w-full bg-white border border-hairline text-text-primary rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all duration-150 placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary shadow-xs"
      />
    </form>
  );
};
