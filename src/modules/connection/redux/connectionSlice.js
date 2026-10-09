import { createSlice } from '@reduxjs/toolkit';

/**
 * Connection Redux Slice
 * Manages pending requests, accepted connections, loading and error state
 * for the Connection feature.
 *
 * Following FRONTEND_AI_GUIDE.md:
 *   all cross-page state goes through Redux;
 *   mutations happen only via dispatched actions.
 */

const initialState = {
  /** Incoming pending connection requests (recipient = current user) */
  pending: [],
  /** Accepted (friend) connections */
  accepted: [],
  isLoading: false,
  /** Non-null string when fetch failed */
  error: null,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setPending(state, action) {
      state.pending = action.payload;
    },
    setAccepted(state, action) {
      state.accepted = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    /** Remove a single entry from pending list after accept/decline */
    removePending(state, action) {
      state.pending = state.pending.filter((c) => c.id !== action.payload);
    },
    /** Remove a single entry from accepted list after unfriend */
    removeAccepted(state, action) {
      state.accepted = state.accepted.filter((c) => c.id !== action.payload);
    },
    /** Reset the whole slice (e.g. on logout) */
    resetConnections() {
      return initialState;
    },
  },
});

export const {
  setPending,
  setAccepted,
  setLoading,
  setError,
  removePending,
  removeAccepted,
  resetConnections,
} = connectionSlice.actions;

export default connectionSlice.reducer;
