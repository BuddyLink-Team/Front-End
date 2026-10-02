import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  children: [],
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
    setParentChildren: (state, action) => {
      state.children = Array.isArray(action.payload) ? action.payload : [];
    },
    setParentLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setParentUpdating: (state, action) => {
      state.isUpdating = action.payload;
    },
    setParentUploadingAvatar: (state, action) => {
      state.isUploadingAvatar = action.payload;
    },
    setParentError: (state, action) => {
      state.error = action.payload;
    },
    clearParentState: (state) => {
      state.profile = null;
      state.children = [];
      state.isLoading = false;
      state.isUpdating = false;
      state.isUploadingAvatar = false;
      state.error = null;
    },
  },
});

export const {
  setParentProfile,
  updateParentProfile,
  updateParentAvatar,
  setParentChildren,
  setParentLoading,
  setParentUpdating,
  setParentUploadingAvatar,
  setParentError,
  clearParentState,
} = parentSlice.actions;

export default parentSlice.reducer;
