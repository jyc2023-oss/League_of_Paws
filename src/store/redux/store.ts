import {configureStore} from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/userSlice';
import communityReducer from './slices/contentSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    community: communityReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
