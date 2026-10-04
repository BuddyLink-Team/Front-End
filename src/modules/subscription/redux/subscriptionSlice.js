import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subscriptionApi from '../api/subscriptionApi';

// 1. Fetch all active subscription plans
export const fetchActivePlans = createAsyncThunk(
  'subscription/fetchActivePlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getActivePlans();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể tải danh sách gói cước');
    }
  }
);

// 2. Fetch current subscription & usage quota
export const fetchMySubscriptionQuota = createAsyncThunk(
  'subscription/fetchMySubscriptionQuota',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getMySubscriptionQuota();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể tải thông tin gói cước');
    }
  }
);

// 3. Create PayOS checkout session
export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckoutSession',
  async ({ planCode, idempotencyKey }, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.createCheckout({ planCode }, idempotencyKey);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể khởi tạo liên kết thanh toán PayOS');
    }
  }
);

// 4. Verify payment status
export const verifyPayment = createAsyncThunk(
  'subscription/verifyPayment',
  async (orderCode, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.verifyPayment(orderCode);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể kiểm tra trạng thái thanh toán');
    }
  }
);

// 5. Fetch payment history
export const fetchPaymentHistory = createAsyncThunk(
  'subscription/fetchPaymentHistory',
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getPaymentHistory(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể tải lịch sử giao dịch');
    }
  }
);

const initialState = {
  plans: [],
  selectedPlan: 'premium_monthly',
  billingCycle: 'monthly',
  subscription: null,
  usage: null,
  effectivePlanCode: 'free',
  isPremium: false,
  currentOrder: null,
  paymentHistory: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0 },
  },
  loading: false,
  checkoutLoading: false,
  verifyLoading: false,
  historyLoading: false,
  error: null,
  // Global Paywall Modal state
  isPaywallOpen: false,
  paywallReason: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    openPaywall: (state, action) => {
      state.isPaywallOpen = true;
      state.paywallReason = action.payload || {
        feature: 'general',
        title: 'Đã Chạm Hạn Mức Gói Miễn Phí',
        message: 'Bạn đã chạm trần hạn mức của gói Miễn phí. Nâng cấp Premium để tiếp tục trải nghiệm không giới hạn!',
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
        action.payload === 'yearly' ? 'premium_yearly' : 'premium_monthly';
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
    resetSubscriptionState: () => {
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('bl_checkout_key_')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchActivePlans
      .addCase(fetchActivePlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.plans || [];
      })
      .addCase(fetchActivePlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMySubscriptionQuota
      .addCase(fetchMySubscriptionQuota.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMySubscriptionQuota.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.subscription = action.payload.subscription || null;
          state.usage = action.payload.usage || null;
          state.effectivePlanCode = action.payload.effectivePlanCode || 'free';
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

      // Reset subscription state on auth/logout
      .addCase('auth/logout', () => {
        if (typeof sessionStorage !== 'undefined') {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith('bl_checkout_key_')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        return initialState;
      });
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
