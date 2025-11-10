import {configureStore} from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/userSlice';
import communityReducer from './slices/contentSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    user: userReducer, 
    community: communityReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
