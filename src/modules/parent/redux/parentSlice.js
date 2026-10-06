import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { parentApi } from '../api/parentApi';

// ---- Thunks (API calls for the parent profile live here, not in hooks/components) ----

export const fetchMyParentProfile = createApiThunk('parent/fetchMyProfile', () =>
  parentApi.getMyProfile(),
);

export const saveParentProfile = createApiThunk('parent/saveProfile', (updateData) =>
  parentApi.updateProfile(updateData),
);

export const uploadParentAvatar = createApiThunk('parent/uploadAvatar', (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return parentApi.uploadAvatar(formData);
});

// Returns { success, tokens }: the backend revokes every session and issues a new pair
export const changeAccountPassword = createApiThunk('parent/changePassword', (payload) =>
  parentApi.changePassword(payload),
);

const initialState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  isUploadingAvatar: false,
  error: null,
};

export const parentSlice = createSlice({
  name: 'parent',
  initialState,
  reducers: {
    setParentProfile: (state, action) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateParentProfile: (state, action) => {
      state.profile = state.profile
        ? { ...state.profile, ...action.payload }
        : action.payload;
    },
    updateParentAvatar: (state, action) => {
      if (state.profile) {
        state.profile.avatarUrl = action.payload;
      }
    },
    setParentError: (state, action) => {
      state.error = action.payload;
    },
    clearParentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyParentProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyParentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchMyParentProfile.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(saveParentProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(saveParentProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = state.profile ? { ...state.profile, ...action.payload } : action.payload;
      })
      .addCase(saveParentProfile.rejected, (state) => {
        state.isUpdating = false;
      })

      .addCase(uploadParentAvatar.pending, (state) => {
        state.isUploadingAvatar = true;
      })
      .addCase(uploadParentAvatar.fulfilled, (state, action) => {
        state.isUploadingAvatar = false;
        if (state.profile && action.payload?.avatarUrl) {
          state.profile.avatarUrl = action.payload.avatarUrl;
        }
      })
      .addCase(uploadParentAvatar.rejected, (state) => {
        state.isUploadingAvatar = false;
      });
  },
});

export const {
  setParentProfile,
  updateParentProfile,
  updateParentAvatar,
  setParentError,
  clearParentState,
} = parentSlice.actions;

export default parentSlice.reducer;
