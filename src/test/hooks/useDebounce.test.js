import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce hook', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('updates debounced value after delay', () => {
    vi.useFakeTimers();
    let value = 'initial';
    const { result, rerender } = renderHook(() => useDebounce(value, 300));

    expect(result.current).toBe('initial');

    value = 'updated';
    rerender();

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
    vi.useRealTimers();
  });
});
