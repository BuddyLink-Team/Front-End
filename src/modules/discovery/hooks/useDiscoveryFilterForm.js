import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../redux/discoverySlice';
import { AGE_RANGE_YEARS, DEFAULT_DISCOVERY_FILTERS } from '../constants/discoveryConstants';

const toFormState = (filters) => ({ ...DEFAULT_DISCOVERY_FILTERS, ...(filters || {}) });

/** Position (%) of an age on the dual slider track */
const toTrackPercent = (age) => ((age - AGE_RANGE_YEARS.MIN) / (AGE_RANGE_YEARS.MAX - AGE_RANGE_YEARS.MIN)) * 100;

/**
 * Local draft of the discovery filters, committed to the discovery slice on apply.
 * @param {boolean} isOpen - Re-sync the draft with saved filters whenever the modal opens
 * @param {() => void} onClose
 */
export const useDiscoveryFilterForm = (isOpen, onClose) => {
  const dispatch = useDispatch();
  const { filters: savedFilters, defaultFilters } = useSelector((state) => state.discovery);
  const [form, setForm] = useState(() => toFormState(savedFilters || defaultFilters));

  useEffect(() => {
    if (isOpen) setForm(toFormState(savedFilters || defaultFilters));
  }, [isOpen, savedFilters, defaultFilters]);

  const setMaxDistance = useCallback((value) => {
    setForm((prev) => ({ ...prev, maxDistance: parseInt(value, 10) }));
  }, []);

  // The two age thumbs cannot cross each other
  const setMinAge = useCallback((value) => {
    setForm((prev) => ({ ...prev, minAge: Math.min(parseInt(value, 10), prev.maxAge) }));
  }, []);

  const setMaxAge = useCallback((value) => {
    setForm((prev) => ({ ...prev, maxAge: Math.max(parseInt(value, 10), prev.minAge) }));
  }, []);

  const setPersonalities = useCallback((personalities) => {
    setForm((prev) => ({ ...prev, personalities }));
  }, []);

  // Back to the parent's preferences
  const reset = useCallback(() => {
    setForm(toFormState(defaultFilters));
    dispatch(resetFilters());
  }, [dispatch, defaultFilters]);

  const apply = useCallback(() => {
    dispatch(setFilters(form));
    onClose();
  }, [dispatch, form, onClose]);

  return {
    form,
    ageTrack: { left: toTrackPercent(form.minAge), right: 100 - toTrackPercent(form.maxAge) },
    // Keep the min thumb on top when it reaches the right end so it stays draggable
    isMinAgeOnTop: form.minAge >= AGE_RANGE_YEARS.MAX - 1,
    setMaxDistance,
    setMinAge,
    setMaxAge,
    setPersonalities,
    reset,
    apply,
  };
};

export default useDiscoveryFilterForm;
