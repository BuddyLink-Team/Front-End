import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../../constants/storage.constants';
import { createApiThunk } from '../../../utils/reduxUtils';
import tokenStore from '../../../services/tokenStore';
import { authApi } from '../api/authApi';
import {
  saveParentProfile,
  uploadParentAvatar,
  changeAccountPassword,
} from '../../parent/redux/parentSlice';

// ---- Thunks (API calls for authentication live here, not in hooks/components) ----

export const registerUser = createApiThunk('auth/register', (payload) => authApi.register(payload));

export const loginUser = createApiThunk('auth/login', (credentials) => authApi.login(credentials));

export const loginWithGoogle = createApiThunk('auth/loginWithGoogle', (idToken) =>
  authApi.googleLogin({ idToken }),
);

export const requestPasswordReset = createApiThunk('auth/requestPasswordReset', (email) =>
  authApi.forgotPassword({ email }),
);

export const resetPassword = createApiThunk('auth/resetPassword', (payload) =>
  authApi.resetPassword(payload),
);

export const sendPhoneOtp = createApiThunk('auth/sendPhoneOtp', (phone) => authApi.sendPhoneOtp({ phone }));

export const verifyPhoneOtp = createApiThunk('auth/verifyPhoneOtp', ({ phone, otp }) =>
  authApi.verifyPhoneOtp({ phone, otp }),
);

export const verifyFirebasePhone = createApiThunk('auth/verifyFirebasePhone', (idToken) =>
  authApi.verifyFirebasePhone({ idToken }),
);

export const sendEmailOtp = createApiThunk('auth/sendEmailOtp', () => authApi.sendEmailOtp());

export const verifyEmailOtp = createApiThunk('auth/verifyEmailOtp', (otp) => authApi.verifyEmailOtp({ otp }));

/**
 * Revoke the refresh token on the server. Never rejects: local logout must happen even offline.
 */
export const logoutUser = createApiThunk('auth/logout', async () => {
  try {
    return await authApi.logout(tokenStore.getRefreshToken());
  } catch {
    return null;
  }
});

/**
 * Restore the session on app start: load the current user from /auth/me with the stored tokens
 * (apiClient refreshes an expired access token) so the cached profile is never trusted blindly.
 */
export const restoreSession = createApiThunk('auth/restoreSession', () => authApi.getMe());

export const SESSION_STATUS = Object.freeze({
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  GUEST: 'guest',
});

// ---- State ----

const cachedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || 'null');
const hasStoredSession = Boolean(cachedUser && tokenStore.getRefreshToken());

const initialState = {
  // Cached profile for a fast first paint; the session itself is verified by restoreSession
  user: cachedUser,
  parent: JSON.parse(localStorage.getItem(STORAGE_KEYS.PARENT_INFO) || 'null'),
  isAuthenticated: false,
  sessionStatus: hasStoredSession ? SESSION_STATUS.CHECKING : SESSION_STATUS.GUEST,
  isLoading: false,
  error: null,
};

const persistParent = (state) => {
  if (state.parent) {
    localStorage.setItem(STORAGE_KEYS.PARENT_INFO, JSON.stringify(state.parent));
  }
};

const persistUser = (state) => {
  if (state.user) {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(state.user));
  }
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, tokens, parent } = action.payload;
      state.user = user;
      state.parent = parent || null;
      state.isAuthenticated = true;
      state.sessionStatus = SESSION_STATUS.AUTHENTICATED;
      state.error = null;
      if (tokens) tokenStore.setTokens(tokens);
      persistUser(state);
      persistParent(state);
    },
    logout: (state) => {
      state.user = null;
      state.parent = null;
      state.isAuthenticated = false;
      state.sessionStatus = SESSION_STATUS.GUEST;
      state.error = null;
      tokenStore.clear();
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      localStorage.removeItem(STORAGE_KEYS.PARENT_INFO);
    },
    // Keep the session copy of the parent (Navbar, route guards) in sync after profile edits
    updateParentInfo: (state, action) => {
      if (!state.parent || !action.payload) return;
      const { fullName, avatarUrl, verification } = action.payload;
      state.parent = {
        ...state.parent,
        ...(fullName !== undefined ? { fullName } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(verification ? { verification: { ...state.parent.verification, ...verification } } : {}),
      };
      persistParent(state);
    },
    // Replace the token pair (e.g. after a password change rotated all sessions)
    setTokens: (_state, action) => {
      tokenStore.setTokens(action.payload || {});
    },
    updateVerification: (state, action) => {
      const { verification, phone } = action.payload;
      if (state.parent && verification) {
        state.parent.verification = { ...state.parent.verification, ...verification };
        persistParent(state);
      }
      if (state.user && phone) {
        state.user.phone = phone;
        persistUser(state);
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.sessionStatus = SESSION_STATUS.CHECKING;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        const { user, parent } = action.payload || {};
        authSlice.caseReducers.setCredentials(state, { payload: { user, parent } });
      })
      .addCase(restoreSession.rejected, (state) => {
        authSlice.caseReducers.logout(state);
      })

      // Session established: { user, parent, tokens }
      .addMatcher(
        isAnyOf(registerUser.fulfilled, loginUser.fulfilled, loginWithGoogle.fulfilled),
        (state, action) => {
          const { user, parent, tokens } = action.payload || {};
          authSlice.caseReducers.setCredentials(state, {
            payload: { user, parent, tokens },
          });
        },
      )

      // OTP verification results
      .addMatcher(isAnyOf(verifyPhoneOtp.fulfilled), (state, action) => {
        authSlice.caseReducers.updateVerification(state, {
          payload: { verification: action.payload, phone: action.meta.arg.phone },
        });
      })
      .addMatcher(isAnyOf(verifyFirebasePhone.fulfilled), (state, action) => {
        authSlice.caseReducers.updateVerification(state, {
          payload: { verification: action.payload?.verification, phone: action.payload?.phone },
        });
      })
      .addMatcher(isAnyOf(verifyEmailOtp.fulfilled), (state, action) => {
        authSlice.caseReducers.updateVerification(state, { payload: { verification: action.payload } });
      })

      .addMatcher(isAnyOf(logoutUser.fulfilled), (state) => {
        authSlice.caseReducers.logout(state);
      })

      // Profile edits made in the parent module (name, avatar, phone -> verification reset)
      .addMatcher(isAnyOf(saveParentProfile.fulfilled), (state, action) => {
        authSlice.caseReducers.updateParentInfo(state, action);
        if (action.payload?.phone) {
          authSlice.caseReducers.updateVerification(state, { payload: { phone: action.payload.phone } });
        }
      })
      .addMatcher(isAnyOf(uploadParentAvatar.fulfilled), (state, action) => {
        authSlice.caseReducers.updateParentInfo(state, {
          payload: { avatarUrl: action.payload?.avatarUrl },
        });
      })
      .addMatcher(isAnyOf(changeAccountPassword.fulfilled), (state, action) => {
        if (action.payload?.tokens) {
          authSlice.caseReducers.setTokens(state, { payload: action.payload.tokens });
        }
      })

      // Global auth request flag
      .addMatcher(
        isAnyOf(registerUser.pending, loginUser.pending, loginWithGoogle.pending),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          registerUser.fulfilled,
          registerUser.rejected,
          loginUser.fulfilled,
          loginUser.rejected,
          loginWithGoogle.fulfilled,
          loginWithGoogle.rejected,
        ),
        (state) => {
          state.isLoading = false;
        },
      );
  },
});

export const {
  setCredentials,
  logout,
  updateParentInfo,
  setTokens,
  updateVerification,
  setLoading,
  setError,
} = authSlice.actions;

export default authSlice.reducer;
