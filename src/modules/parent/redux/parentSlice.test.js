import { describe, it, expect } from 'vitest';
import parentReducer, {
  setParentProfile,
  updateParentProfile,
  updateParentAvatar,
  clearParentState,
  fetchMyParentProfile,
  saveParentProfile,
  uploadParentAvatar,
} from './parentSlice';

describe('parentSlice reducer', () => {
  const initialState = {
    profile: null,
    isLoading: false,
    isUpdating: false,
    isUploadingAvatar: false,
    error: null,
  };

  it('should return initial state when action is unknown', () => {
    expect(parentReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setParentProfile', () => {
    const mockProfile = { id: 'p1', fullName: 'Nguyen Van Parent', city: 'HCMC' };
    const nextState = parentReducer(initialState, setParentProfile(mockProfile));

    expect(nextState.profile).toEqual(mockProfile);
    expect(nextState.error).toBeNull();
  });

  it('should handle updateParentProfile merging with existing profile', () => {
    const startState = {
      ...initialState,
      profile: { id: 'p1', fullName: 'Nguyen Van Parent', bio: 'Old bio' },
    };
    const nextState = parentReducer(startState, updateParentProfile({ bio: 'New bio' }));

    expect(nextState.profile.fullName).toBe('Nguyen Van Parent');
    expect(nextState.profile.bio).toBe('New bio');
  });

  it('should handle updateParentAvatar', () => {
    const startState = {
      ...initialState,
      profile: { id: 'p1', avatarUrl: 'old_url.jpg' },
    };
    const nextState = parentReducer(startState, updateParentAvatar('new_url.jpg'));

    expect(nextState.profile.avatarUrl).toBe('new_url.jpg');
  });

  it('should handle clearParentState on logout', () => {
    const activeState = {
      profile: { id: 'p1', fullName: 'Parent' },
      isLoading: false,
      isUpdating: false,
      isUploadingAvatar: false,
      error: 'Some error',
    };
    const nextState = parentReducer(activeState, clearParentState());

    expect(nextState).toEqual(initialState);
  });

  it('should track loading flags and store results of profile thunks', () => {
    let state = parentReducer(initialState, { type: fetchMyParentProfile.pending.type });
    expect(state.isLoading).toBe(true);

    state = parentReducer(state, {
      type: fetchMyParentProfile.fulfilled.type,
      payload: { id: 'p1', fullName: 'Me Lan' },
    });
    expect(state.isLoading).toBe(false);
    expect(state.profile.fullName).toBe('Me Lan');

    state = parentReducer(state, { type: saveParentProfile.pending.type });
    expect(state.isUpdating).toBe(true);
    state = parentReducer(state, { type: saveParentProfile.fulfilled.type, payload: { bio: 'Xin chao' } });
    expect(state.isUpdating).toBe(false);
    expect(state.profile).toMatchObject({ fullName: 'Me Lan', bio: 'Xin chao' });

    state = parentReducer(state, { type: uploadParentAvatar.pending.type });
    expect(state.isUploadingAvatar).toBe(true);
    state = parentReducer(state, {
      type: uploadParentAvatar.fulfilled.type,
      payload: { avatarUrl: 'https://cdn/a.png' },
    });
    expect(state.isUploadingAvatar).toBe(false);
    expect(state.profile.avatarUrl).toBe('https://cdn/a.png');
  });
});
