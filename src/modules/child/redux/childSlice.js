import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { childApi } from '../api/childApi';

// ---- Thunks (API calls for child profiles live here, not in hooks/components) ----

export const fetchMyChildren = createApiThunk('child/fetchMyChildren', () => childApi.getMyChildren());

export const fetchChildById = createApiThunk('child/fetchById', (id) => childApi.getChildById(id));

export const createChild = createApiThunk('child/create', (payload) => childApi.createChild(payload));

export const updateChild = createApiThunk('child/update', ({ id, payload }) =>
  childApi.updateChild(id, payload),
);

export const deleteChild = createApiThunk('child/delete', (id) => childApi.deleteChild(id));

/**
 * Onboarding: save matching criteria & location, then create the first child profile.
 * Returns the created child.
 */
export const completeOnboarding = createApiThunk(
  'child/completeOnboarding',
  async ({ preferences, child }) => {
    await childApi.updateOnboardingPreferences(preferences);
    return childApi.createChild(child);
  },
);

export const CHILD_LIST_STATUS = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
});

const initialState = {
  children: [],
  selectedChild: null,
  listStatus: CHILD_LIST_STATUS.IDLE,
  // Create / update / onboarding submit in progress
  isLoading: false,
  error: null,
};

const getChildId = (child) => child?.id || child?._id;

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
      const index = state.children.findIndex((c) => getChildId(c) === getChildId(action.payload));
      if (index !== -1) {
        state.children[index] = action.payload;
      }
      if (getChildId(state.selectedChild) === getChildId(action.payload)) {
        state.selectedChild = action.payload;
      }
    },
    removeChildFromList: (state, action) => {
      state.children = state.children.filter((c) => getChildId(c) !== action.payload);
      if (getChildId(state.selectedChild) === action.payload) {
        state.selectedChild = state.children[0] || null;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // Called on logout so the next account never sees the previous account's children
    resetChildState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyChildren.pending, (state) => {
        state.listStatus = CHILD_LIST_STATUS.LOADING;
      })
      .addCase(fetchMyChildren.fulfilled, (state, action) => {
        state.listStatus = CHILD_LIST_STATUS.SUCCEEDED;
        state.children = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyChildren.rejected, (state) => {
        state.listStatus = CHILD_LIST_STATUS.FAILED;
      })

      .addCase(fetchChildById.fulfilled, (state, action) => {
        state.selectedChild = action.payload;
      })

      .addCase(updateChild.fulfilled, (state, action) => {
        childSlice.caseReducers.updateChildInList(state, action);
      })

      .addCase(deleteChild.fulfilled, (state, action) => {
        childSlice.caseReducers.removeChildFromList(state, { payload: action.meta.arg });
      })

      .addMatcher(isAnyOf(createChild.fulfilled, completeOnboarding.fulfilled), (state, action) => {
        childSlice.caseReducers.addChild(state, action);
      })

      // Submit loading flag for the create/edit form and onboarding
      .addMatcher(isAnyOf(createChild.pending, updateChild.pending, completeOnboarding.pending), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(
          createChild.fulfilled,
          createChild.rejected,
          updateChild.fulfilled,
          updateChild.rejected,
          completeOnboarding.fulfilled,
          completeOnboarding.rejected,
        ),
        (state) => {
          state.isLoading = false;
        },
      );
  },
});

export const {
  setChildren,
  setSelectedChild,
  addChild,
  updateChildInList,
  removeChildFromList,
  setError,
  resetChildState,
} = childSlice.actions;

export default childSlice.reducer;
