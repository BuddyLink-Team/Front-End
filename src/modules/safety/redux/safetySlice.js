import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { safetyApi } from '../api/safetyApi';

// ---- Thunks ----

export const blockParent = createApiThunk('safety/blockParent', ({ blockedId, reason }) =>
  safetyApi.blockUser({ blockedId, reason }),
);

export const reportParent = createApiThunk('safety/reportParent', (payload) => safetyApi.reportUser(payload));

const initialState = {
  isSubmitting: false,
};

export const safetySlice = createSlice({
  name: 'safety',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(blockParent.pending, reportParent.pending), (state) => {
        state.isSubmitting = true;
      })
      .addMatcher(
        isAnyOf(blockParent.fulfilled, blockParent.rejected, reportParent.fulfilled, reportParent.rejected),
        (state) => {
          state.isSubmitting = false;
        },
      );
  },
});

export default safetySlice.reducer;
