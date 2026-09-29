import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../../constants/storage.constants';

const initialState = {
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || 'null'),
  parent: JSON.parse(localStorage.getItem(STORAGE_KEYS.PARENT_INFO) || 'null'),
  token: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken, parent } = action.payload;
      state.user = user;
      state.token = token;
      state.parent = parent || null;
      state.isAuthenticated = true;
      state.error = null;
      if (token) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      if (user) localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      if (parent) localStorage.setItem(STORAGE_KEYS.PARENT_INFO, JSON.stringify(parent));
    },
    logout: (state) => {
      state.user = null;
      state.parent = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      localStorage.removeItem(STORAGE_KEYS.PARENT_INFO);
    },
    updateVerification: (state, action) => {
      const { verification, phone } = action.payload;
      if (state.parent && verification) {
        state.parent.verification = { ...state.parent.verification, ...verification };
        localStorage.setItem(STORAGE_KEYS.PARENT_INFO, JSON.stringify(state.parent));
      }
      if (state.user && phone) {
        state.user.phone = phone;
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(state.user));
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, updateVerification, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
