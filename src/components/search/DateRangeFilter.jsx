import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FilterChips } from './FilterChips';
import { Input } from '../ui/Input';
import { cn } from '../../utils/cn';

const DATE_FORMAT = 'YYYY-MM-DD';
const CUSTOM_ID = 'custom';

const toRange = (from, to) => ({ from: from.format(DATE_FORMAT), to: to.format(DATE_FORMAT) });

const DEFAULT_DATE_RANGE_PRESETS = [
  { id: '7d', label: '7 ngày', getRange: (today) => toRange(today.subtract(6, 'day'), today) },
  { id: '30d', label: '30 ngày', getRange: (today) => toRange(today.subtract(29, 'day'), today) },
  { id: 'thisMonth', label: 'Tháng này', getRange: (today) => toRange(today.startOf('month'), today) },
];

/**
 * DateRangeFilter - preset chips (7 ngày, 30 ngày, Tháng này) plus a custom from/to range.
 * Dates go in and out as 'YYYY-MM-DD', ready for the `fromDate` / `toDate` query params;
 * an empty string means no bound.
 *
 * @param {string} [from='']
 * @param {string} [to='']
 * @param {Function} onChange - ({ from, to }) => void
 * @param {Array<{id: string, label: string, getRange: (today: dayjs.Dayjs) => {from: string, to: string}}>} [presets]
 * @param {string} [className]
 */
export const DateRangeFilter = ({
  from = '',
  to = '',
  onChange,
  presets = DEFAULT_DATE_RANGE_PRESETS,
  className,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const today = dayjs();
  const matchedPreset = presets.find((preset) => {
    const range = preset.getRange(today);
    return range.from === from && range.to === to;
  });
  const hasRange = Boolean(from || to);
  const selected = isCustomOpen || (hasRange && !matchedPreset) ? CUSTOM_ID : matchedPreset?.id || null;

  const handleChipChange = (id) => {
    if (id === CUSTOM_ID) {
      setIsCustomOpen(true);
      return;
    }
    setIsCustomOpen(false);
    if (!id) {
      onChange?.({ from: '', to: '' });
      return;
    }
    const preset = presets.find((item) => item.id === id);
    if (preset) onChange?.(preset.getRange(dayjs()));
  };

  const handleClear = () => {
    setIsCustomOpen(false);
    onChange?.({ from: '', to: '' });
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <FilterChips
        options={[...presets, { id: CUSTOM_ID, label: 'Tùy chỉnh' }]}
        selected={selected}
        onChange={handleChipChange}
        onClear={handleClear}
      />

      {selected === CUSTOM_ID && (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <Input
            id="date-range-from"
            type="date"
            label="Từ ngày"
            value={from}
            max={to || undefined}
            onChange={(e) => onChange?.({ from: e.target.value, to })}
          />
          <Input
            id="date-range-to"
            type="date"
            label="Đến ngày"
            value={to}
            min={from || undefined}
            onChange={(e) => onChange?.({ from, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
