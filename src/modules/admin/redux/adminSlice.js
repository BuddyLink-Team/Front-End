import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { adminApi } from '../api/adminApi';

// ---- Thunks ----

// Lists are paged by useServerTable, which keeps the rows; these thunks only route the calls through Redux
export const fetchAdminUsers = createApiThunk('admin/fetchUsers', (params) => adminApi.getUsers(params));

export const fetchAdminChildren = createApiThunk('admin/fetchChildren', (params) => adminApi.getChildren(params));

// Platform-wide counts shown above the lists (kept by useAdminStats)
export const fetchAdminUserStats = createApiThunk('admin/fetchUserStats', () => adminApi.getUserStats());

export const fetchAdminChildStats = createApiThunk('admin/fetchChildStats', () => adminApi.getChildStats());

export const fetchAdminUserDetail = createApiThunk('admin/fetchUserDetail', (userId) =>
  adminApi.getUserDetail(userId)
);

export const fetchAdminUserPayments = createApiThunk('admin/fetchUserPayments', (params) =>
  adminApi.getPayments(params)
);

export const updateAdminUserStatus = createApiThunk('admin/updateUserStatus', ({ userId, isActive }) =>
  adminApi.updateUserStatus(userId, { isActive })
);

export const fetchAdminChildDetail = createApiThunk('admin/fetchChildDetail', (childId) =>
  adminApi.getChildDetail(childId)
);

// Playdates & connections oversight: list, detail, and the admin action on one of them
export const fetchAdminPlaydates = createApiThunk('admin/fetchPlaydates', (params) => adminApi.getPlaydates(params));

export const fetchAdminPlaydateStats = createApiThunk('admin/fetchPlaydateStats', () => adminApi.getPlaydateStats());

export const fetchAdminPlaydateDetail = createApiThunk('admin/fetchPlaydateDetail', (playdateId) =>
  adminApi.getPlaydateDetail(playdateId)
);

export const cancelAdminPlaydate = createApiThunk('admin/cancelPlaydate', ({ id, reason }) =>
  adminApi.cancelPlaydate(id, reason)
);

export const fetchAdminConnections = createApiThunk('admin/fetchConnections', (params) =>
  adminApi.getConnections(params)
);

export const fetchAdminConnectionStats = createApiThunk('admin/fetchConnectionStats', () =>
  adminApi.getConnectionStats()
);

export const fetchAdminConnectionDetail = createApiThunk('admin/fetchConnectionDetail', (connectionId) =>
  adminApi.getConnectionDetail(connectionId)
);

export const removeAdminConnection = createApiThunk('admin/removeConnection', ({ id, reason }) =>
  adminApi.removeConnection(id, reason)
);

// Subscription plans & revenue: results are kept by the hooks of that screen
export const fetchAdminPlans = createApiThunk('admin/fetchPlans', () => adminApi.getPlans());

export const fetchAdminPlanDetail = createApiThunk('admin/fetchPlanDetail', (id) => adminApi.getPlanDetail(id));

export const updateAdminPlan = createApiThunk('admin/updatePlan', ({ id, payload }) => adminApi.updatePlan(id, payload));

export const fetchAdminSubscriptions = createApiThunk('admin/fetchSubscriptions', (params) =>
  adminApi.getSubscriptions(params)
);

export const fetchAdminSubscriptionDetail = createApiThunk('admin/fetchSubscriptionDetail', (id) =>
  adminApi.getSubscriptionDetail(id)
);

export const fetchAdminTransactions = createApiThunk('admin/fetchTransactions', (params) =>
  adminApi.getTransactions(params)
);

export const fetchAdminTransactionDetail = createApiThunk('admin/fetchTransactionDetail', (id) =>
  adminApi.getTransactionDetail(id)
);

export const fetchAdminRevenueSummary = createApiThunk('admin/fetchRevenueSummary', (params) =>
  adminApi.getRevenueSummary(params)
);

const emptyDetail = { data: null, isLoading: false, error: null, requestId: null };

const initialState = {
  userDetail: { ...emptyDetail },
  payments: { items: [], total: 0, isLoading: false, requestId: null },
  childDetail: { ...emptyDetail },
  isUpdatingStatus: false,
  playdateDetail: { ...emptyDetail },
  connectionDetail: { ...emptyDetail },
  isOversightActionLoading: false,
};

// A detail request answered after another one started (or after the drawer closed) is ignored
const isCurrentRequest = (slot, action) => slot.requestId === action.meta.requestId;

// Detail slot of an oversight modal: keep the open item on screen while it reloads (after an admin action)
const addOversightDetailCases = (builder, thunk, slotKey) =>
  builder
    .addCase(thunk.pending, (state, action) => {
      const isSameItem = state[slotKey].data?.id === action.meta.arg;
      state[slotKey] = {
        data: isSameItem ? state[slotKey].data : null,
        isLoading: true,
        error: null,
        requestId: action.meta.requestId,
      };
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (!isCurrentRequest(state[slotKey], action)) return;
      state[slotKey].data = action.payload;
      state[slotKey].isLoading = false;
    })
    .addCase(thunk.rejected, (state, action) => {
      if (!isCurrentRequest(state[slotKey], action)) return;
      state[slotKey].data = null;
      state[slotKey].isLoading = false;
      state[slotKey].error = action.payload || action.error;
    });

const addOversightActionCases = (builder, thunk) =>
  builder
    .addCase(thunk.pending, (state) => {
      state.isOversightActionLoading = true;
    })
    .addCase(thunk.fulfilled, (state) => {
      state.isOversightActionLoading = false;
    })
    .addCase(thunk.rejected, (state) => {
      state.isOversightActionLoading = false;
    });

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearUserDetail: (state) => {
      state.userDetail = { ...emptyDetail };
      state.payments = initialState.payments;
    },
    clearChildDetail: (state) => {
      state.childDetail = { ...emptyDetail };
    },
    clearPlaydateDetail: (state) => {
      state.playdateDetail = { ...emptyDetail };
    },
    clearConnectionDetail: (state) => {
      state.connectionDetail = { ...emptyDetail };
    },
  },
  extraReducers: (builder) => {
    builder
      // User detail: keep the account on screen while it reloads, clear it when another one is opened
      .addCase(fetchAdminUserDetail.pending, (state, action) => {
        const isSameUser = state.userDetail.data?.id === action.meta.arg;
        state.userDetail = {
          data: isSameUser ? state.userDetail.data : null,
          isLoading: true,
          error: null,
          requestId: action.meta.requestId,
        };
        if (!isSameUser) state.payments = initialState.payments;
      })
      .addCase(fetchAdminUserDetail.fulfilled, (state, action) => {
        if (!isCurrentRequest(state.userDetail, action)) return;
        state.userDetail.data = action.payload;
        state.userDetail.isLoading = false;
      })
      .addCase(fetchAdminUserDetail.rejected, (state, action) => {
        if (!isCurrentRequest(state.userDetail, action)) return;
        state.userDetail.data = null;
        state.userDetail.isLoading = false;
        state.userDetail.error = action.payload || action.error;
      })

      // Recent payments of the open account
      .addCase(fetchAdminUserPayments.pending, (state, action) => {
        state.payments.isLoading = true;
        state.payments.requestId = action.meta.requestId;
      })
      .addCase(fetchAdminUserPayments.fulfilled, (state, action) => {
        if (!isCurrentRequest(state.payments, action)) return;
        const data = action.payload || {};
        state.payments.items = data.items || [];
        state.payments.total = data.pagination?.total ?? state.payments.items.length;
        state.payments.isLoading = false;
      })
      .addCase(fetchAdminUserPayments.rejected, (state, action) => {
        if (!isCurrentRequest(state.payments, action)) return;
        state.payments.items = [];
        state.payments.total = 0;
        state.payments.isLoading = false;
      })

      // Lock / unlock
      .addCase(updateAdminUserStatus.pending, (state) => {
        state.isUpdatingStatus = true;
      })
      .addCase(updateAdminUserStatus.fulfilled, (state) => {
        state.isUpdatingStatus = false;
      })
      .addCase(updateAdminUserStatus.rejected, (state) => {
        state.isUpdatingStatus = false;
      })

      // Child detail
      .addCase(fetchAdminChildDetail.pending, (state, action) => {
        state.childDetail = { data: null, isLoading: true, error: null, requestId: action.meta.requestId };
      })
      .addCase(fetchAdminChildDetail.fulfilled, (state, action) => {
        if (!isCurrentRequest(state.childDetail, action)) return;
        state.childDetail.data = action.payload;
        state.childDetail.isLoading = false;
      })
      .addCase(fetchAdminChildDetail.rejected, (state, action) => {
        if (!isCurrentRequest(state.childDetail, action)) return;
        state.childDetail.isLoading = false;
        state.childDetail.error = action.payload || action.error;
      });

    addOversightDetailCases(builder, fetchAdminPlaydateDetail, 'playdateDetail');
    addOversightDetailCases(builder, fetchAdminConnectionDetail, 'connectionDetail');
    addOversightActionCases(builder, cancelAdminPlaydate);
    addOversightActionCases(builder, removeAdminConnection);
  },
});

export const { clearUserDetail, clearChildDetail, clearPlaydateDetail, clearConnectionDetail } = adminSlice.actions;

export default adminSlice.reducer;
