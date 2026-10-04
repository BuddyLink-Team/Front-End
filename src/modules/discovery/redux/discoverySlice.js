import { createSlice } from "@reduxjs/toolkit";

/**
 * Discovery Redux Slice
 * Manages filter state, profile list, and quota meta for the discovery feature.
 * Following FRONTEND_AI_GUIDE.md: all state goes through Redux, never component-local state for cross-page data.
 */

const initialState = {
  filters: {
    maxDistance: 20,
    minAge: 1,
    maxAge: 12,
    personalities: [],
  },
  profiles: [],
  meta: null,
  isLoading: false,
  error: null,
};

const discoverySlice = createSlice({
  name: "discovery",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    setProfiles(state, action) {
      state.profiles = action.payload;
    },
    removeTopProfile(state) {
      state.profiles = state.profiles.slice(1);
    },
    setMeta(state, action) {
      state.meta = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setFilters,
  resetFilters,
  setProfiles,
  removeTopProfile,
  setMeta,
  setLoading,
  setError,
} = discoverySlice.actions;

export default discoverySlice.reducer;
