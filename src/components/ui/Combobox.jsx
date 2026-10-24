import React, { useId, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../utils/cn';

// Case and accent insensitive ("lego" finds "Xếp hình Lego", "ve tranh" finds "Vẽ tranh")
const normalize = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

/**
 * Text input with a filterable list of options: the user picks an option or types any text.
 *
 * @param {string} value
 * @param {(value: string) => void} onChange - Typed text or the value of the picked option
 * @param {Array<{ value: string, label: string, description?: string, icon?: React.ComponentType, group?: string }>} options
 *   Options of the same `group` are listed under its header, in the given order
 * @param {string} [label]
 * @param {string} [placeholder]
 * @param {string} [error]
 * @param {string} [emptyText] - Shown when no option matches the typed text
 */
export const Combobox = ({
  value = '',
  onChange,
  onBlur,
  options = [],
  label,
  placeholder,
  error,
  id,
  name,
  emptyText = 'Không có gợi ý phù hợp, bạn có thể giữ nội dung đã nhập.',
}) => {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const listId = `${inputId}-list`;
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  useClickOutside(containerRef, isOpen, () => setIsOpen(false));

  // Opening shows every option; typing filters them
  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!term) return options;
    return options.filter((o) => normalize(`${o.label} ${o.description || ''}`).includes(term));
  }, [options, query]);

  const open = () => {
    setQuery('');
    setActiveIndex(-1);
    setIsOpen(true);
  };

  const pick = (option) => {
    onChange(option.value);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) open();
      else setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter' && isOpen && filtered[activeIndex]) {
      event.preventDefault();
      pick(filtered[activeIndex]);
    } else if (event.key === 'Escape' && isOpen) {
      event.stopPropagation();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          value={value}
          placeholder={placeholder}
          onFocus={open}
          onClick={() => !isOpen && open()}
          onChange={(event) => {
            onChange(event.target.value);
            setQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full bg-white border border-hairline text-text-primary rounded-xl pl-4 pr-10 py-2.5 text-sm transition-all duration-150 placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
            error && 'border-red-400 focus:ring-red-200 focus:border-red-500'
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? 'Đóng danh sách' : 'Mở danh sách'}
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
      </div>

      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto rounded-xl border border-hairline bg-surface-container-lowest shadow-dialog py-1"
        >
          {filtered.length === 0 && <li className="px-3 py-2.5 text-xs text-text-muted">{emptyText}</li>}
          {filtered.map((option, index) => {
            const Icon = option.icon;
            const isSelected = option.value === value;
            const showGroup = option.group && option.group !== filtered[index - 1]?.group;
            return (
              <React.Fragment key={`${option.group || ''}-${option.value}`}>
                {showGroup && (
                  <li role="presentation" className="px-3 pt-2.5 pb-1 text-label-sm uppercase tracking-wider text-text-muted">
                    {option.group}
                  </li>
                )}
                <li
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  // mousedown: pick before the input loses focus
                  onMouseDown={(event) => {
                    event.preventDefault();
                    pick(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'mx-1 px-2.5 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer',
                    index === activeIndex ? 'bg-primary-soft' : 'hover:bg-surface-container-low'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0 text-primary" />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-text-primary">{option.label}</span>
                    {option.description && <span className="block text-label-sm text-text-muted">{option.description}</span>}
                  </span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-primary" />}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

Combobox.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.elementType,
      group: PropTypes.string,
    })
  ),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  emptyText: PropTypes.string,
};

export default Combobox;
