import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { subscriptionApi } from '../api/subscriptionApi';
import { createChild, deleteChild, completeOnboarding } from '../../child/redux/childSlice';

// ---- Thunks ----

// Returns { subscription, quota: { planCode, limits, usage } }
export const fetchMySubscriptionQuota = createApiThunk('subscription/fetchMyQuota', () =>
  subscriptionApi.getMySubscriptionQuota(),
);

const initialState = {
  subscription: null,
  quota: null,
  isLoading: false,
  error: null,
};

const adjustChildUsage = (state, delta) => {
  if (state.quota?.usage) {
    state.quota.usage.childProfiles = Math.max(0, (state.quota.usage.childProfiles || 0) + delta);
  }
};

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // Called on logout so the next account never sees the previous account's plan
    resetSubscriptionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubscriptionQuota.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySubscriptionQuota.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload?.subscription || null;
        state.quota = action.payload?.quota || null;
      })
      .addCase(fetchMySubscriptionQuota.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error;
      })
      // Keep the child-profile usage counter in sync without refetching
      .addCase(deleteChild.fulfilled, (state) => adjustChildUsage(state, -1))
      .addMatcher(isAnyOf(createChild.fulfilled, completeOnboarding.fulfilled), (state) =>
        adjustChildUsage(state, 1),
      );
  },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
