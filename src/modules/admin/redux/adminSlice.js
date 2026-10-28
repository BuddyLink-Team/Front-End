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

const emptyDetail = { data: null, isLoading: false, error: null, requestId: null };

const initialState = {
  userDetail: { ...emptyDetail },
  payments: { items: [], total: 0, isLoading: false, requestId: null },
  childDetail: { ...emptyDetail },
  isUpdatingStatus: false,
};

// A detail request answered after another one started (or after the drawer closed) is ignored
const isCurrentRequest = (slot, action) => slot.requestId === action.meta.requestId;

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
  },
});

export const { clearUserDetail, clearChildDetail } = adminSlice.actions;

export default adminSlice.reducer;
