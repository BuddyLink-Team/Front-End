import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { RequiredMark } from '../../../components/form/RequiredMark';

/**
 * One box per digit of a one-time code (same look as the OTP verification screen).
 * Controlled by a plain string, so it plugs into react-hook-form through a Controller.
 */
export const OtpCodeInput = ({ id, label, required, value = '', onChange, onBlur, error, length = 6 }) => {
  const inputRefs = useRef([]);
  const digits = Array.from({ length }, (_, idx) => value[idx] || '');

  const focusBox = (index) => inputRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus();

  const setDigits = (nextDigits) => onChange(nextDigits.join(''));

  const handleChange = (index, rawValue) => {
    const typed = rawValue.replace(/\D/g, '');
    // Autofill ("one-time-code") or typing over a filled box can bring several digits at once
    if (typed.length > 1) {
      const next = [...digits];
      typed
        .slice(0, length - index)
        .split('')
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      setDigits(next);
      focusBox(index + typed.length);
      return;
    }

    const next = [...digits];
    next[index] = typed;
    setDigits(next);
    if (typed) focusBox(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      focusBox(index - 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusBox(pasted.length);
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={`${id}-0`} className="block text-sm font-medium text-text-primary">
          {label}
          {required && <RequiredMark />}
        </label>
      )}

      <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            id={`${id}-${idx}`}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            maxLength={idx === 0 ? length : 1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onFocus={(e) => e.target.select()}
            onBlur={onBlur}
            aria-label={`Số thứ ${idx + 1} của mã khôi phục`}
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full max-w-14 min-w-0 h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all outline-none text-on-surface',
              digit
                ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                : 'border-hairline-strong bg-surface-container-low focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20',
              error && !digit && 'border-red-400',
            )}
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

OtpCodeInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  length: PropTypes.number,
};

export default OtpCodeInput;
