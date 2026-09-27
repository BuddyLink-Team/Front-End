import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../../constants/storage.constants';

const initialState = {
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || 'null'),
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
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      if (token) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      if (user) localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
