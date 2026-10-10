import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { playdateApi } from '../api/playdateApi';
import { PLAYDATE_VIEW_MODES } from '../constants/playdateConstants';

// ---- Thunks (all playdate API calls live here) ----

export const fetchPlaydates = createApiThunk('playdate/fetchList', (params) =>
  playdateApi.getPlaydates(params),
);

export const fetchPlaydateDetail = createApiThunk(
  'playdate/fetchDetail',
  (id) => playdateApi.getPlaydateById(id),
);

export const fetchRescheduleRequest = createApiThunk(
  'playdate/fetchReschedule',
  (id) => playdateApi.getReschedule(id),
);

export const fetchInvitableFriends = createApiThunk(
  'playdate/fetchFriends',
  (params) => playdateApi.getFriends(params),
);

// meta.areaSyncing: the Back-End is fetching the places of this area, search again shortly
export const fetchNearbyPlaces = createApiThunk(
  'playdate/fetchNearbyPlaces',
  async (params) => {
    const response = await playdateApi.getNearbyPlaces(params);
    return { places: response?.data || [], areaSyncing: Boolean(response?.meta?.areaSyncing) };
  },
);

export const fetchPlaceDetail = createApiThunk(
  'playdate/fetchPlaceDetail',
  (id) => playdateApi.getPlaceById(id),
);

export const createPlaydate = createApiThunk('playdate/create', (payload) =>
  playdateApi.createPlaydate(payload),
);

export const completePlaydate = createApiThunk('playdate/complete', (id) =>
  playdateApi.completePlaydate(id),
);

export const cancelPlaydate = createApiThunk(
  'playdate/cancel',
  ({ id, reason }) => playdateApi.cancelPlaydate(id, { reason }),
);

export const respondToPlaydate = createApiThunk(
  'playdate/respond',
  ({ id, status }) => playdateApi.respondToPlaydate(id, status),
);

export const createRescheduleRequest = createApiThunk(
  'playdate/createReschedule',
  ({ id, payload }) => playdateApi.createReschedule(id, payload),
);

export const voteRescheduleRequest = createApiThunk(
  'playdate/voteReschedule',
  ({ id, requestId, status }) =>
    playdateApi.voteReschedule(id, { requestId, status }),
);

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
  rescheduleRequest: null,
  friends: [],
  activeTab: 'all',
  viewMode: PLAYDATE_VIEW_MODES.LIST, // 'list' | 'calendar'
  searchQuery: '',
  // List view page, and the pagination of the last list response
  page: 1,
  pagination: null,
  isLoading: false,
  isDetailLoading: false,
  isActionLoading: false,
  error: null,
};

// Keep a playdate returned by an action in sync in the list and the opened detail
const upsertPlaydate = (state, playdate) => {
  if (!playdate?.id) return;
  const index = state.items.findIndex((item) => item.id === playdate.id);
  if (index !== -1) state.items[index] = { ...state.items[index], ...playdate };
  if (state.selectedPlaydate?.id === playdate.id) {
    state.selectedPlaydate = { ...state.selectedPlaydate, ...playdate };
  }
};

// Mark a playdate completed in the list / detail and move it between the tab counts
const applyCompleted = (state, updatedItem) => {
  const index = state.items.findIndex((item) => item.id === updatedItem.id);
  const prevItem = index !== -1 ? state.items[index] : state.selectedPlaydate;
  const prevStatus = prevItem?.displayStatus || prevItem?.status;

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
  // Re-adjust counts according to the previous status
  if (prevStatus === 'confirmed' && state.counts.confirmed > 0) {
    state.counts.confirmed -= 1;
  } else if (prevStatus === 'pending' && state.counts.pending > 0) {
    state.counts.pending -= 1;
  }
  if (state.counts.completed !== undefined) {
    state.counts.completed += 1;
  }
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
      state.page = 1;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearPlaydateDetail: (state) => {
      state.selectedPlaydate = null;
      state.rescheduleRequest = null;
    },
    markPlaydateCompleted: (state, action) => {
      applyCompleted(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchPlaydates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlaydates.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.items = Array.isArray(data) ? data : data?.playdates || [];
        state.pagination = data?.pagination || null;
        if (data?.counts) state.counts = { ...state.counts, ...data.counts };
      })
      .addCase(fetchPlaydates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      // Detail
      .addCase(fetchPlaydateDetail.pending, (state, action) => {
        state.isDetailLoading = true;
        // Do not show the previous playdate while another one loads
        if (state.selectedPlaydate?.id !== action.meta.arg) {
          state.selectedPlaydate = null;
          state.rescheduleRequest = null;
        }
      })
      .addCase(fetchPlaydateDetail.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.selectedPlaydate = action.payload || null;
      })
      .addCase(fetchPlaydateDetail.rejected, (state) => {
        state.isDetailLoading = false;
      })
      .addCase(fetchRescheduleRequest.fulfilled, (state, action) => {
        state.rescheduleRequest = action.payload || null;
      })
      .addCase(fetchRescheduleRequest.rejected, (state) => {
        state.rescheduleRequest = null;
      })
      .addCase(fetchInvitableFriends.fulfilled, (state, action) => {
        const data = action.payload;
        state.friends = Array.isArray(data) ? data : data?.friends || [];
      })
      // Actions returning the updated playdate
      .addCase(completePlaydate.fulfilled, (state, action) => {
        applyCompleted(state, action.payload);
      })
      .addMatcher(
        isAnyOf(cancelPlaydate.fulfilled, respondToPlaydate.fulfilled),
        (state, action) => {
          upsertPlaydate(state, action.payload);
        },
      )
      // Reschedule actions return { rescheduleRequest, playdate }
      .addMatcher(
        isAnyOf(
          createRescheduleRequest.fulfilled,
          voteRescheduleRequest.fulfilled,
        ),
        (state, action) => {
          if (action.payload?.rescheduleRequest)
            state.rescheduleRequest = action.payload.rescheduleRequest;
          upsertPlaydate(state, action.payload?.playdate);
        },
      )
      .addMatcher(
        isAnyOf(
          completePlaydate.pending,
          cancelPlaydate.pending,
          respondToPlaydate.pending,
          createRescheduleRequest.pending,
          voteRescheduleRequest.pending,
          createPlaydate.pending,
        ),
        (state) => {
          state.isActionLoading = true;
        },
      )
      .addMatcher(
        isAnyOf(
          completePlaydate.fulfilled,
          completePlaydate.rejected,
          cancelPlaydate.fulfilled,
          cancelPlaydate.rejected,
          respondToPlaydate.fulfilled,
          respondToPlaydate.rejected,
          createRescheduleRequest.fulfilled,
          createRescheduleRequest.rejected,
          voteRescheduleRequest.fulfilled,
          voteRescheduleRequest.rejected,
          createPlaydate.fulfilled,
          createPlaydate.rejected,
        ),
        (state) => {
          state.isActionLoading = false;
        },
      );
  },
});

export const {
  setPlaydates,
  setCounts,
  setSelectedPlaydate,
  setActiveTab,
  setViewMode,
  setSearchQuery,
  setPage,
  setLoading,
  setError,
  clearPlaydateDetail,
  markPlaydateCompleted,
} = playdateSlice.actions;

export default playdateSlice.reducer;
