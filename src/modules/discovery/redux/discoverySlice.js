import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { discoveryApi } from '../api/discoveryApi';
import { DISCOVERY_PAGE_SIZE } from '../constants/discoveryConstants';

// ---- Thunks ----

export const fetchDiscoveryProfiles = createApiThunk('discovery/fetchProfiles', (filters) =>
  discoveryApi.getProfiles(filters),
);

export const swipeDiscoveryProfile = createApiThunk('discovery/swipe', ({ targetChildId, isLike }) =>
  discoveryApi.swipe({ targetChildId, isLike }),
);

/**
 * Filters use the backend query keys (maxDistanceKm, ageMin, ageMax, interests).
 * Empty filters let the backend fall back to the parent's saved preferences.
 */
const initialState = {
  filters: {},
  profiles: [],
  meta: null,
  hasMore: false,
  isLoading: false,
  error: null,
};

const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    // Optimistically drop a card as soon as it is swiped
    removeProfile(state, action) {
      state.profiles = state.profiles.filter((p) => p.childId !== action.payload);
    },
    // Put a card back on top of the stack when its swipe failed
    restoreProfile(state, action) {
      const profile = action.payload;
      if (!state.profiles.some((p) => p.childId === profile.childId)) {
        state.profiles.unshift(profile);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscoveryProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscoveryProfiles.fulfilled, (state, action) => {
        const profiles = action.payload?.profiles || [];
        state.isLoading = false;
        state.profiles = profiles;
        state.meta = action.payload?.meta || null;
        state.hasMore = profiles.length >= DISCOVERY_PAGE_SIZE;
      })
      .addCase(fetchDiscoveryProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      .addCase(swipeDiscoveryProfile.fulfilled, (state, action) => {
        if (state.meta && action.payload?.remainingViews !== undefined) {
          state.meta.remainingViews = action.payload.remainingViews;
        }
      });
  },
});

export const { setFilters, resetFilters, removeProfile, restoreProfile } = discoverySlice.actions;

export default discoverySlice.reducer;
