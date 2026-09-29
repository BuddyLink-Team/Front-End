import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  children: [],
  selectedChild: null,
  isLoading: false,
  error: null,
  // Onboarding draft in case parent refreshes
  onboardingDraft: {
    child: {
      displayName: '',
      dateOfBirth: '',
      gender: 'boy',
      interests: [],
      favoriteActivities: [],
      personality: [],
    },
    preferences: {
      preferredPlaydateDays: ['weekend'],
      preferredTimeSlots: ['morning', 'afternoon'],
      preferredLocations: ['park', 'kids_cafe'],
      maxDistanceKm: 10,
      preferredAgeRange: { min: 2, max: 8 },
      languages: ['Vietnamese'],
      additionalNotes: '',
    },
    location: {
      address: '',
      area: 'Quận 1',
      city: 'Hồ Chí Minh',
      coordinates: [106.6953, 10.7769],
    },
  },
};

export const childSlice = createSlice({
  name: 'child',
  initialState,
  reducers: {
    setChildren: (state, action) => {
      state.children = action.payload;
    },
    setSelectedChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    addChild: (state, action) => {
      state.children.unshift(action.payload);
      state.selectedChild = action.payload;
    },
    updateChildInList: (state, action) => {
      const index = state.children.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.children[index] = action.payload;
      }
      if (state.selectedChild?.id === action.payload.id) {
        state.selectedChild = action.payload;
      }
    },
    removeChildFromList: (state, action) => {
      state.children = state.children.filter((c) => c.id !== action.payload);
      if (state.selectedChild?.id === action.payload) {
        state.selectedChild = state.children[0] || null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateOnboardingDraft: (state, action) => {
      state.onboardingDraft = {
        ...state.onboardingDraft,
        ...action.payload,
      };
    },
    resetOnboardingDraft: (state) => {
      state.onboardingDraft = initialState.onboardingDraft;
    },
  },
});

export const {
  setChildren,
  setSelectedChild,
  addChild,
  updateChildInList,
  removeChildFromList,
  setLoading,
  setError,
  updateOnboardingDraft,
  resetOnboardingDraft,
} = childSlice.actions;

export default childSlice.reducer;
