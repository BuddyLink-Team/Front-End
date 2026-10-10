import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const IDLE_CLASS =
  'bg-white border-hairline text-on-surface-variant hover:border-outline-variant/60 hover:bg-surface-container-low/60';

const VARIANTS = {
  // Card with a round check on the right (e.g. days of the week)
  check: {
    container: 'grid grid-cols-1 sm:grid-cols-2 gap-2.5',
    item: 'p-3.5 rounded-xl text-left justify-between active:scale-[0.99]',
    selected: 'bg-primary/10 border-primary text-primary-dark font-semibold shadow-xs',
  },
  // Centered tile filled when selected (e.g. time slots)
  tile: {
    container: 'grid grid-cols-1 sm:grid-cols-3 gap-2.5',
    item: 'py-3 px-3.5 rounded-xl text-center justify-center gap-2 active:scale-[0.99]',
    selected: 'bg-primary text-white border-primary shadow-xs font-semibold',
  },
  // Pill chip (e.g. venue types, interests)
  chip: {
    container: 'flex flex-wrap gap-2',
    item: 'px-4 py-2 rounded-full gap-1.5 active:scale-95',
    selected: 'bg-primary text-white border-primary shadow-xs font-semibold',
  },
};

/**
 * Multi-select option buttons.
 *
 * @param {Array<{value: string, label: React.ReactNode, icon?: React.ComponentType}>} options -
 *   An icon replaces the check mark of the 'tile' and 'chip' variants
 * @param {Array<string>} selected - Selected values
 * @param {Function} onToggle - Receives the clicked value
 * @param {'check'|'tile'|'chip'} [variant='chip']
 * @param {string} [className] - Extra classes for the container (e.g. a different grid)
 */
export const SelectableOptions = ({ options = [], selected = [], onToggle, variant = 'chip', className }) => {
  const style = VARIANTS[variant] || VARIANTS.chip;

  return (
    <div className={cn(style.container, className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle?.(option.value)}
            className={cn(
              'border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center cursor-pointer',
              style.item,
              isSelected ? style.selected : IDLE_CLASS
            )}
          >
            {variant === 'check' ? (
              <>
                <span>{option.label}</span>
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0',
                    isSelected ? 'bg-primary text-white' : 'border border-hairline bg-surface-container-low'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </>
            ) : (
              <>
                {option.icon ? (
                  <option.icon className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  isSelected && <Check className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{option.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SelectableOptions;
