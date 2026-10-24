import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from '../../../hooks/useDebounce';
import { SUGGESTION_DEBOUNCE_MS } from '../constants/playdateConstants';

const EMPTY = [];

/**
 * One list loaded from a thunk, reloaded (debounced) only when its own params change.
 * The previous result stays on screen while reloading (no skeleton flash, no layout jump);
 * a failure just leaves the list empty.
 *
 * @param {Function} thunk
 * @param {Object|null} params - null: nothing to load
 * @param {string} resultKey - Field of the response holding the list
 * @param {number} [delayMs]
 * @returns {{ items: Array, isLoading: boolean, isRefreshing: boolean }}
 *   isLoading: nothing to show yet; isRefreshing: newer results are on their way
 */
export const useDebouncedQuery = (thunk, params, resultKey, delayMs = SUGGESTION_DEBOUNCE_MS) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({ items: EMPTY, loadedKey: null });
  const requestKey = params ? JSON.stringify(params) : null;
  const debouncedKey = useDebounce(requestKey, delayMs);

  useEffect(() => {
    if (!debouncedKey) {
      setState({ items: EMPTY, loadedKey: null });
      return undefined;
    }
    let isCurrent = true;
    dispatch(thunk(JSON.parse(debouncedKey)))
      .unwrap()
      .then((data) => isCurrent && setState({ items: data?.[resultKey] || EMPTY, loadedKey: debouncedKey }))
      .catch(() => isCurrent && setState({ items: EMPTY, loadedKey: debouncedKey }));
    return () => {
      isCurrent = false;
    };
  }, [debouncedKey, dispatch, thunk, resultKey]);

  return {
    items: requestKey ? state.items : EMPTY,
    isLoading: Boolean(requestKey) && state.loadedKey === null,
    isRefreshing: Boolean(requestKey) && state.loadedKey !== null && state.loadedKey !== requestKey,
  };
};

export default useDebouncedQuery;
