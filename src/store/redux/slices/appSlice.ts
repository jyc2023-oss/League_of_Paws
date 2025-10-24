import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type ThemePreference = 'light' | 'dark' | 'system';

export type AppState = {
  isOnboarded: boolean;
  themePreference: ThemePreference;
};

const initialState: AppState = {
  isOnboarded: false,
  themePreference: 'system'
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    completeOnboarding(state) {
      state.isOnboarded = true;
    },
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    }
  }
});

export const {completeOnboarding, setThemePreference} = appSlice.actions;

export default appSlice.reducer;
