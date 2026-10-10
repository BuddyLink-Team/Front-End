import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Single-value slider with a label, the current value as a pill and optional marks under the track.
 *
 * @param {React.ReactNode} label
 * @param {React.ReactNode} [valueLabel] - Shown in the pill (defaults to the value)
 * @param {number} value
 * @param {Function} onChange - Receives the new value as a number
 * @param {number} [min=0]
 * @param {number} [max=100]
 * @param {number} [step=1]
 * @param {Array<React.ReactNode>} [marks] - Labels spread under the track
 * @param {string} [id]
 * @param {string} [className]
 */
export const RangeSlider = ({
  label,
  valueLabel,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks = [],
  id,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-xs sm:text-sm font-semibold text-on-surface flex items-center gap-1.5">
        {label}
      </label>
      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
        {valueLabel ?? value}
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
      className="w-full h-2.5 bg-white border border-hairline rounded-lg appearance-none cursor-pointer accent-primary mt-2 transition-all"
    />
    {marks.length > 0 && (
      <div className="flex justify-between text-[11px] text-text-muted font-medium pt-1">
        {marks.map((mark, index) => (
          <span key={index}>{mark}</span>
        ))}
      </div>
    )}
  </div>
);

export default RangeSlider;
