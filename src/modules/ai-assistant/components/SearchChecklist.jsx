import React, { useId, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Search, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { removeAccents } from '../../../utils/formatters';

// Case and accent insensitive ("thu" finds "Minh Thư")
const normalize = (text) => removeAccents(text).toLowerCase().trim();

/**
 * Pick several items of a known list by searching it: only listed items can be picked, so nothing is mistyped.
 * Picked items stay on top as removable chips.
 *
 * @param {string} label
 * @param {Array<{ value: string, label: string, description?: string }>} items
 * @param {string[]} selected - Picked values
 * @param {(value: string) => void} onToggle
 * @param {string} [placeholder]
 * @param {boolean} [isLoading]
 * @param {string} [emptyText] - No item at all (e.g. no friend yet)
 * @param {string} [helperText]
 */
export const SearchChecklist = ({
  label,
  items,
  selected,
  onToggle,
  placeholder = 'Tìm…',
  isLoading = false,
  emptyText = 'Chưa có lựa chọn nào.',
  helperText,
}) => {
  const inputId = useId();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = normalize(query);
    return term ? items.filter((item) => normalize(`${item.label} ${item.description || ''}`).includes(term)) : items;
  }, [items, query]);
  const picked = items.filter((item) => selected.includes(item.value));

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
        {label}
      </label>

      {picked.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {picked.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onToggle(item.value)}
              aria-label={`Bỏ chọn ${item.label}`}
              className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-2.5 py-1 text-label-sm font-medium text-white"
            >
              {item.label}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-text-muted" />
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          // Enter must not send the form while searching
          onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
          className="w-full rounded-xl border border-hairline-strong bg-surface-container-lowest py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <ul
        role="listbox"
        aria-multiselectable="true"
        aria-label={`Kết quả: ${label}`}
        className="max-h-48 overflow-y-auto rounded-xl border border-hairline bg-surface-container-lowest py-1"
      >
        {isLoading && <li className="px-3 py-2 text-xs text-text-muted">Đang tải…</li>}
        {!isLoading && items.length === 0 && <li className="px-3 py-2 text-xs text-text-muted">{emptyText}</li>}
        {!isLoading && items.length > 0 && filtered.length === 0 && (
          <li className="px-3 py-2 text-xs text-text-muted">Không tìm thấy “{query.trim()}”.</li>
        )}
        {!isLoading &&
          filtered.map((item) => {
            const isSelected = selected.includes(item.value);
            return (
              <li
                key={item.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => onToggle(item.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggle(item.value);
                  }
                }}
                className={cn(
                  'mx-1 flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isSelected ? 'bg-primary-soft' : 'hover:bg-surface-container-low'
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-text-primary">{item.label}</span>
                  {item.description && <span className="block text-label-sm text-text-muted">{item.description}</span>}
                </span>
                {isSelected && <Check className="w-4 h-4 shrink-0 text-primary" />}
              </li>
            );
          })}
      </ul>

      {helperText && <p className="text-xs text-text-muted">{helperText}</p>}
    </div>
  );
};

SearchChecklist.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired, description: PropTypes.string })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  emptyText: PropTypes.string,
  helperText: PropTypes.string,
};

export default SearchChecklist;
