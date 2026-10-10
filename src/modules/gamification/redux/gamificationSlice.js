import { createSlice } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { gamificationApi } from '../api/gamificationApi';

// ---- Thunks ----

// Returns { streak, badges: [{ code, title, description, requirementCount, unlocked, unlockedAt }] }
export const fetchAchievements = createApiThunk('gamification/fetchAchievements', () =>
  gamificationApi.getAchievements(),
);

const initialState = {
  streak: null,
  badges: [],
  isLoaded: false,
  isLoading: false,
  error: null,
};

export const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // Called on logout so the next account never sees the previous account's achievements
    resetGamificationState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        state.streak = action.payload?.streak || null;
        state.badges = action.payload?.badges || [];
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { resetGamificationState } = gamificationSlice.actions;

export default gamificationSlice.reducer;
