import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { subscriptionApi } from '../api/subscriptionApi';
import { BILLING_CYCLES, PLAN_CODES, QUOTA_FEATURES, QUOTA_MESSAGES } from '../constants/subscriptionConstants';
import { createChild, deleteChild, completeOnboarding } from '../../child/redux/childSlice';

// ---- Thunks (rejected payload: API error body { message, error: { code } }) ----

export const fetchActivePlans = createApiThunk('subscription/fetchActivePlans', () =>
  subscriptionApi.getActivePlans(),
);

// { isPremium, effectivePlanCode, subscription, usage }
export const fetchMySubscriptionQuota = createApiThunk('subscription/fetchMySubscriptionQuota', () =>
  subscriptionApi.getMySubscriptionQuota(),
);

export const createCheckoutSession = createApiThunk(
  'subscription/createCheckoutSession',
  ({ planCode, idempotencyKey }) => subscriptionApi.createCheckout({ planCode }, idempotencyKey),
);

export const verifyPayment = createApiThunk('subscription/verifyPayment', (orderCode) =>
  subscriptionApi.verifyPayment(orderCode),
);

export const fetchPaymentHistory = createApiThunk(
  'subscription/fetchPaymentHistory',
  (params = { page: 1, limit: 10 }) => subscriptionApi.getPaymentHistory(params),
);

const initialState = {
  plans: [],
  selectedPlan: PLAN_CODES.PREMIUM_MONTHLY,
  billingCycle: BILLING_CYCLES.MONTHLY,
  subscription: null,
  usage: null,
  effectivePlanCode: PLAN_CODES.FREE,
  isPremium: false,
  currentOrder: null,
  paymentHistory: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0 },
  },
  plansLoading: false,
  // GET /subscriptions/my (plan + usage); quotaLoaded once it answered at least once
  loading: false,
  quotaLoaded: false,
  checkoutLoading: false,
  verifyLoading: false,
  historyLoading: false,
  error: null,
  // Global Paywall Modal state
  isPaywallOpen: false,
  paywallReason: null,
};

// Keep the child-profile usage counter in sync without refetching
const adjustChildUsage = (state, delta) => {
  const childQuota = state.usage?.[QUOTA_FEATURES.CHILD_PROFILES];
  if (!childQuota) return;
  childQuota.used = Math.max(0, (childQuota.used || 0) + delta);
  if (childQuota.limit !== -1 && childQuota.remaining !== null && childQuota.remaining !== undefined) {
    childQuota.remaining = Math.max(0, childQuota.limit - childQuota.used);
  }
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    openPaywall: (state, action) => {
      state.isPaywallOpen = true;
      state.paywallReason = action.payload || {
        feature: QUOTA_FEATURES.GENERAL,
        ...QUOTA_MESSAGES[QUOTA_FEATURES.GENERAL],
      };
    },
    closePaywall: (state) => {
      state.isPaywallOpen = false;
      state.paywallReason = null;
    },
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    setBillingCycle: (state, action) => {
      state.billingCycle = action.payload;
      state.selectedPlan =
        action.payload === BILLING_CYCLES.YEARLY ? PLAN_CODES.PREMIUM_YEARLY : PLAN_CODES.PREMIUM_MONTHLY;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    // Called on logout (useAuth, which also clears the checkout keys)
    resetSubscriptionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchActivePlans
      .addCase(fetchActivePlans.pending, (state) => {
        state.plansLoading = true;
        state.error = null;
      })
      .addCase(fetchActivePlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.plans || [];
      })
      .addCase(fetchActivePlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.error = action.payload;
      })

      // fetchMySubscriptionQuota
      .addCase(fetchMySubscriptionQuota.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMySubscriptionQuota.fulfilled, (state, action) => {
        state.loading = false;
        state.quotaLoaded = true;
        if (action.payload) {
          state.subscription = action.payload.subscription || null;
          state.usage = action.payload.usage || null;
          state.effectivePlanCode = action.payload.effectivePlanCode || PLAN_CODES.FREE;
          state.isPremium = Boolean(action.payload.isPremium);
        }
      })
      .addCase(fetchMySubscriptionQuota.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createCheckoutSession
      .addCase(createCheckoutSession.pending, (state) => {
        state.checkoutLoading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.error = action.payload;
      })

      // verifyPayment
      .addCase(verifyPayment.pending, (state) => {
        state.verifyLoading = true;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifyLoading = false;
        if (action.payload) {
          state.currentOrder = {
            ...state.currentOrder,
            ...action.payload,
          };
          if (action.payload.subscription) {
            state.subscription = action.payload.subscription;
          }
        }
      })
      .addCase(verifyPayment.rejected, (state) => {
        state.verifyLoading = false;
      })

      // fetchPaymentHistory
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        if (Array.isArray(action.payload)) {
          state.paymentHistory = {
            items: action.payload,
            pagination: { page: 1, limit: 10, total: action.payload.length },
          };
        } else if (action.payload?.items) {
          state.paymentHistory = action.payload;
        } else {
          state.paymentHistory = {
            items: [],
            pagination: { page: 1, limit: 10, total: 0 },
          };
        }
      })
      .addCase(fetchPaymentHistory.rejected, (state) => {
        state.historyLoading = false;
      })

      .addCase(deleteChild.fulfilled, (state) => adjustChildUsage(state, -1))

      .addMatcher(isAnyOf(createChild.fulfilled, completeOnboarding.fulfilled), (state) =>
        adjustChildUsage(state, 1),
      );
  },
});

export const {
  openPaywall,
  closePaywall,
  setSelectedPlan,
  setBillingCycle,
  setCurrentOrder,
  clearCurrentOrder,
  clearSubscriptionError,
  resetSubscriptionState,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
