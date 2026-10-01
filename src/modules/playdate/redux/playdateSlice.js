import { createSlice } from '@reduxjs/toolkit';
import { PLAYDATE_VIEW_MODES } from '../constants/playdateConstants';

const initialState = {
  items: [],
  counts: {
    all: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  },
  selectedPlaydate: null,
  activeTab: 'all',
  viewMode: PLAYDATE_VIEW_MODES.LIST, // 'list' | 'calendar'
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const playdateSlice = createSlice({
  name: 'playdate',
  initialState,
  reducers: {
    setPlaydates: (state, action) => {
      state.items = action.payload || [];
    },
    setCounts: (state, action) => {
      state.counts = {
        ...state.counts,
        ...action.payload,
      };
    },
    setSelectedPlaydate: (state, action) => {
      state.selectedPlaydate = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    markPlaydateCompleted: (state, action) => {
      const updatedItem = action.payload;
      const index = state.items.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...updatedItem,
          status: 'completed',
          displayStatus: 'completed',
        };
      }
      if (state.selectedPlaydate?.id === updatedItem.id) {
        state.selectedPlaydate = {
          ...state.selectedPlaydate,
          ...updatedItem,
          status: 'completed',
          displayStatus: 'completed',
        };
      }
      // Re-adjust counts
      if (state.counts.completed !== undefined) {
        state.counts.completed += 1;
        if (state.counts.confirmed > 0) state.counts.confirmed -= 1;
      }
    },
  },
});

export const {
  setPlaydates,
  setCounts,
  setSelectedPlaydate,
  setActiveTab,
  setViewMode,
  setSearchQuery,
  setLoading,
  setError,
  markPlaydateCompleted,
} = playdateSlice.actions;

export default playdateSlice.reducer;
