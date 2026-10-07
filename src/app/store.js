import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/redux/authSlice';
import childReducer from '../modules/child/redux/childSlice';
import parentReducer from '../modules/parent/redux/parentSlice';
import subscriptionReducer from '../modules/subscription/redux/subscriptionSlice';
import chatReducer from '../modules/chat/redux/chatSlice';
import safetyReducer from '../modules/safety/redux/safetySlice';
import discoveryReducer from '../modules/discovery/redux/discoverySlice';
import playdateReducer from '../modules/playdate/redux/playdateSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    child: childReducer,
    parent: parentReducer,
    subscription: subscriptionReducer,
    chat: chatReducer,
    safety: safetyReducer,
    discovery: discoveryReducer,
    playdate: playdateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
