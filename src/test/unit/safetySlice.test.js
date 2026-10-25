import { describe, it, expect } from 'vitest';
import safetyReducer, {
  blockParent,
  unblockParent,
  reportParent,
  fetchBlockedUsers,
} from '../../modules/safety/redux/safetySlice';

describe('safetySlice reducer', () => {
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

  it('should return initial state when initialized', () => {
    expect(safetyReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('sets isSubmitting = true on pending actions and false on fulfilled/rejected', () => {
    let state = safetyReducer(initialState, { type: blockParent.pending.type });
    expect(state.isSubmitting).toBe(true);

    state = safetyReducer(state, { type: blockParent.fulfilled.type });
    expect(state.isSubmitting).toBe(false);

    state = safetyReducer(state, { type: reportParent.pending.type });
    expect(state.isSubmitting).toBe(true);

    state = safetyReducer(state, { type: reportParent.rejected.type });
    expect(state.isSubmitting).toBe(false);

    state = safetyReducer(state, { type: unblockParent.pending.type });
    expect(state.isSubmitting).toBe(true);

    state = safetyReducer(state, { type: unblockParent.fulfilled.type, meta: { arg: 'p-1' } });
    expect(state.isSubmitting).toBe(false);
  });

  it('stores fetched blocked users and handles pagination', () => {
    const payload = {
      items: [
        { id: 'b-1', parentId: 'p-1', displayName: 'Parent One', reason: 'Spam' },
        { id: 'b-2', parentId: 'p-2', displayName: 'Parent Two', reason: 'Harassment' },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    };

    let state = safetyReducer(initialState, { type: fetchBlockedUsers.pending.type });
    expect(state.isLoadingBlockedUsers).toBe(true);

    state = safetyReducer(state, {
      type: fetchBlockedUsers.fulfilled.type,
      payload,
    });
    expect(state.isLoadingBlockedUsers).toBe(false);
    expect(state.blockedUsers.items).toHaveLength(2);
    expect(state.blockedUsers.pagination.total).toBe(2);
  });

  it('immediately removes unblocked parent from blockedUsers list on unblockParent.fulfilled', () => {
    const populatedState = {
      ...initialState,
      blockedUsers: {
        items: [
          { id: 'b-1', parentId: 'p-1', displayName: 'Parent One' },
          { id: 'b-2', parentId: 'p-2', displayName: 'Parent Two' },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      },
    };

    const state = safetyReducer(populatedState, {
      type: unblockParent.fulfilled.type,
      meta: { arg: 'p-1' },
    });

    expect(state.blockedUsers.items).toHaveLength(1);
    expect(state.blockedUsers.items[0].parentId).toBe('p-2');
    expect(state.blockedUsers.pagination.total).toBe(1);
  });
});
