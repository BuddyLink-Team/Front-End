import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/redux/authSlice';
import childReducer from '../modules/child/redux/childSlice';
import parentReducer from '../modules/parent/redux/parentSlice';
import discoveryReducer from '../modules/discovery/redux/discoverySlice';

import connectionReducer from '../modules/connection/redux/connectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    child: childReducer,
    parent: parentReducer,
    discovery: discoveryReducer,
    connection: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
