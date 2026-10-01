import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/redux/authSlice';
import childReducer from '../modules/child/redux/childSlice';
import playdateReducer from '../modules/playdate/redux/playdateSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    child: childReducer,
    playdate: playdateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
