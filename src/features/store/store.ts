import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import filterReducer from './filterSlice';
import mapReducer from './mapSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: filterReducer,
    map: mapReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;