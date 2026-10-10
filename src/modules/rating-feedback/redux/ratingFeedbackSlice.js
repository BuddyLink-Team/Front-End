import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // The post-playdate rating modal is on screen (other popups wait for it)
  isPromptOpen: false,
};

export const ratingFeedbackSlice = createSlice({
  name: 'ratingFeedback',
  initialState,
  reducers: {
    setRatingPromptOpen: (state, action) => {
      state.isPromptOpen = Boolean(action.payload);
    },
  },
});

export const { setRatingPromptOpen } = ratingFeedbackSlice.actions;

export default ratingFeedbackSlice.reducer;
