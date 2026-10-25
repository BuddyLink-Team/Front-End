import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { safetyApi } from '../api/safetyApi';

// ---- Thunks ----

export const blockParent = createApiThunk('safety/blockParent', ({ blockedId, reason }) =>
  safetyApi.blockUser({ blockedId, reason }),
);

export const unblockParent = createApiThunk('safety/unblockParent', (blockedId) =>
  safetyApi.unblockUser(blockedId),
);

export const reportParent = createApiThunk('safety/reportParent', (payload) =>
  safetyApi.reportUser(payload),
);

export const fetchBlockedUsers = createApiThunk('safety/fetchBlockedUsers', (params) =>
  safetyApi.getBlockedUsers(params),
);

const initialState = {
  isSubmitting: false,
  isLoadingBlockedUsers: false,
  blockedUsersError: null,
  blockedUsers: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  },
};

export const safetySlice = createSlice({
  name: 'safety',
  initialState,
  reducers: {
    clearBlockedUsersError: (state) => {
      state.blockedUsersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blocked users
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.isLoadingBlockedUsers = true;
        state.blockedUsersError = null;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.isLoadingBlockedUsers = false;
        const data = action.payload || {};
        state.blockedUsers = {
          items: data.items || [],
          pagination: data.pagination || {
            page: 1,
            limit: 10,
            total: (data.items || []).length,
            totalPages: 1,
          },
        };
      })
      .addCase(fetchBlockedUsers.rejected, (state, action) => {
        state.isLoadingBlockedUsers = false;
        state.blockedUsersError = action.payload;
      })
      // Immediately remove unblocked user from the local list
      .addCase(unblockParent.fulfilled, (state, action) => {
        const unblockedId = action.meta.arg;
        state.blockedUsers.items = state.blockedUsers.items.filter(
          (item) => item.parentId !== unblockedId && item.id !== unblockedId,
        );
        if (state.blockedUsers.pagination.total > 0) {
          state.blockedUsers.pagination.total -= 1;
        }
      })
      // Submitting block, unblock, or report
      .addMatcher(isAnyOf(blockParent.pending, unblockParent.pending, reportParent.pending), (state) => {
        state.isSubmitting = true;
      })
      .addMatcher(
        isAnyOf(
          blockParent.fulfilled,
          blockParent.rejected,
          unblockParent.fulfilled,
          unblockParent.rejected,
          reportParent.fulfilled,
          reportParent.rejected,
        ),
        (state) => {
          state.isSubmitting = false;
        },
      );
  },
});

export const { clearBlockedUsersError } = safetySlice.actions;
export default safetySlice.reducer;

