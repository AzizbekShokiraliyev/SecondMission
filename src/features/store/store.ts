import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import filterReducer from './filterSlice';
import mapReducer from './mapSlice'
import geoJsonReducer from './geoJsonSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: filterReducer,
    map: mapReducer,
    geoJson: geoJsonReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;