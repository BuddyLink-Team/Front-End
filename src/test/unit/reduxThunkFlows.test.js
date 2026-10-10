import { describe, it, expect, beforeEach } from 'vitest';
import childReducer, {
  fetchMyChildren,
  createChild,
  updateChild,
  deleteChild,
  completeOnboarding,
  resetChildState,
  CHILD_LIST_STATUS,
} from '../../modules/child/redux/childSlice';
import authReducer, { loginUser, verifyPhoneOtp, logoutUser, restoreSession } from '../../modules/auth/redux/authSlice';
import tokenStore from '../../services/tokenStore';
import {
  saveParentProfile,
  uploadParentAvatar,
  changeAccountPassword,
} from '../../modules/parent/redux/parentSlice';

const action = (thunk, status, payload, arg) => ({
  type: thunk[status].type,
  payload,
  meta: { arg },
});

describe('childSlice thunk reducers', () => {
  const initial = childReducer(undefined, { type: 'init' });

  it('tracks list status and stores fetched children', () => {
    expect(initial.listStatus).toBe(CHILD_LIST_STATUS.IDLE);

    let state = childReducer(initial, action(fetchMyChildren, 'pending'));
    expect(state.listStatus).toBe(CHILD_LIST_STATUS.LOADING);

    state = childReducer(state, action(fetchMyChildren, 'fulfilled', [{ id: 'c1' }, { id: 'c2' }]));
    expect(state.listStatus).toBe(CHILD_LIST_STATUS.SUCCEEDED);
    expect(state.children.map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('adds, updates and removes children from thunk results', () => {
    let state = childReducer(initial, action(fetchMyChildren, 'fulfilled', [{ id: 'c1', displayName: 'A' }]));

    state = childReducer(state, action(createChild, 'pending'));
    expect(state.isLoading).toBe(true);
    state = childReducer(state, action(createChild, 'fulfilled', { id: 'c2', displayName: 'B' }));
    expect(state.isLoading).toBe(false);
    expect(state.children[0].id).toBe('c2');

    state = childReducer(state, action(updateChild, 'fulfilled', { id: 'c1', displayName: 'A2' }));
    expect(state.children.find((c) => c.id === 'c1').displayName).toBe('A2');

    state = childReducer(state, action(deleteChild, 'fulfilled', null, 'c1'));
    expect(state.children.map((c) => c.id)).toEqual(['c2']);

    state = childReducer(state, action(completeOnboarding, 'fulfilled', { id: 'c3' }));
    expect(state.children[0].id).toBe('c3');
  });

  it('resets on logout', () => {
    const state = childReducer(
      childReducer(initial, action(fetchMyChildren, 'fulfilled', [{ id: 'c1' }])),
      resetChildState(),
    );
    expect(state).toEqual(initial);
  });
});

describe('authSlice reacts to auth and parent thunks', () => {
  beforeEach(() => localStorage.clear());

  const loggedOut = authReducer(undefined, { type: 'init' });

  it('stores credentials on login', () => {
    const state = authReducer(
      loggedOut,
      action(loginUser, 'fulfilled', {
        user: { id: 'u1', role: 'parent' },
        parent: { id: 'p1', fullName: 'Me Lan', verification: {} },
        tokens: { accessToken: 'a1', refreshToken: 'r1' },
      }),
    );

    expect(state.isAuthenticated).toBe(true);
    expect(state.sessionStatus).toBe('authenticated');
    expect(tokenStore.getAccessToken()).toBe('a1');
    expect(tokenStore.getRefreshToken()).toBe('r1');
  });

  it('restoreSession verifies the session before trusting the cached profile', () => {
    const checking = { ...loggedOut, sessionStatus: 'checking' };

    const restored = authReducer(
      checking,
      action(restoreSession, 'fulfilled', { user: { id: 'u1', role: 'parent' }, parent: { id: 'p1' } }),
    );
    expect(restored.isAuthenticated).toBe(true);

    const expired = authReducer(checking, action(restoreSession, 'rejected'));
    expect(expired.isAuthenticated).toBe(false);
    expect(expired.sessionStatus).toBe('guest');
  });

  const loggedIn = {
    user: { id: 'u1', role: 'parent', phone: null },
    parent: { id: 'p1', fullName: 'Cũ', avatarUrl: '', verification: { isPhoneVerified: false, isEmailVerified: true } },
    isAuthenticated: true,
    sessionStatus: 'authenticated',
    isLoading: false,
    error: null,
  };

  it('applies phone verification with the verified number', () => {
    const state = authReducer(
      loggedIn,
      action(verifyPhoneOtp, 'fulfilled', { isPhoneVerified: true, isEmailVerified: true, isVerifiedParent: true }, {
        phone: '0901234567',
        otp: '123456',
      }),
    );
    expect(state.parent.verification.isPhoneVerified).toBe(true);
    expect(state.user.phone).toBe('0901234567');
  });

  it('syncs Navbar data and rotated tokens from parent module thunks', () => {
    let state = authReducer(
      loggedIn,
      action(saveParentProfile, 'fulfilled', {
        fullName: 'Mới',
        phone: '0907654321',
        verification: { isPhoneVerified: false, isEmailVerified: true },
      }),
    );
    expect(state.parent.fullName).toBe('Mới');
    expect(state.user.phone).toBe('0907654321');

    state = authReducer(state, action(uploadParentAvatar, 'fulfilled', { avatarUrl: 'https://cdn/a.png' }));
    expect(state.parent.avatarUrl).toBe('https://cdn/a.png');

    state = authReducer(
      state,
      action(changeAccountPassword, 'fulfilled', { success: true, tokens: { accessToken: 'a2', refreshToken: 'r2' } }),
    );
    expect(tokenStore.getAccessToken()).toBe('a2');
    expect(tokenStore.getRefreshToken()).toBe('r2');
  });

  it('clears the session when logout completes', () => {
    const state = authReducer(loggedIn, action(logoutUser, 'fulfilled', null));
    expect(state.isAuthenticated).toBe(false);
    expect(state.parent).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});
