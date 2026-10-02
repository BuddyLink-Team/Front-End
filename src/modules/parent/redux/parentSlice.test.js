import { describe, it, expect } from 'vitest';
import parentReducer, {
  setParentProfile,
  updateParentProfile,
  updateParentAvatar,
  setParentChildren,
  setParentLoading,
  clearParentState,
} from './parentSlice';

describe('parentSlice reducer', () => {
  const initialState = {
    profile: null,
    children: [],
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

  it('should handle setParentChildren', () => {
    const mockChildren = [{ id: 'c1', displayName: 'Child 1' }, { id: 'c2', displayName: 'Child 2' }];
    const nextState = parentReducer(initialState, setParentChildren(mockChildren));

    expect(nextState.children).toHaveLength(2);
    expect(nextState.children[0].displayName).toBe('Child 1');
  });

  it('should handle clearParentState on logout', () => {
    const activeState = {
      profile: { id: 'p1', fullName: 'Parent' },
      children: [{ id: 'c1' }],
      isLoading: false,
      isUpdating: false,
      isUploadingAvatar: false,
      error: 'Some error',
    };
    const nextState = parentReducer(activeState, clearParentState());

    expect(nextState).toEqual(initialState);
  });
});
