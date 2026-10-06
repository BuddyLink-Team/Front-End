import React from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * FilterChips - interactive filter chips for quick criteria selection
 * (e.g. Distance, Age range, Gender, Activities, Verified only)
 *
 * @param {Array<{id: string, label: string, icon?: React.ComponentType, count?: number}>} options
 * @param {Array<string>|string} selected - ID or array of IDs selected
 * @param {Function} onChange - (newSelected) => void
 * @param {boolean} [multiple=false] - allow multiple selection
 * @param {Function} [onClear] - optional callback to clear all filters
 */
export const FilterChips = ({
  options = [],
  selected,
  onChange,
  multiple = false,
  onClear,
  className,
}) => {
  const isSelected = (id) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(id);
    }
    return selected === id;
  };

  const handleToggle = (id) => {
    if (!onChange) return;

    if (multiple) {
      const currentList = Array.isArray(selected) ? [...selected] : [];
      const index = currentList.indexOf(id);
      if (index > -1) {
        currentList.splice(index, 1);
      } else {
        currentList.push(id);
      }
      onChange(currentList);
    } else {
      // Single select toggle
      onChange(selected === id ? null : id);
    }
  };

  const hasSelection = multiple
    ? Array.isArray(selected) && selected.length > 0
    : Boolean(selected);

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto py-1 scrollbar-none', className)}>
      {options.map((opt) => {
        const active = isSelected(opt.id);
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleToggle(opt.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 select-none whitespace-nowrap shadow-2xs',
              active
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-text-primary border-hairline hover:bg-gray-50 hover:border-gray-300'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            {active && !Icon && <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
            <span>{opt.label}</span>
            {typeof opt.count !== 'undefined' && (
              <span
                className={cn(
                  'ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-text-muted'
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}

      {hasSelection && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-error transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      )}
    </div>
  );
};

export default FilterChips;
