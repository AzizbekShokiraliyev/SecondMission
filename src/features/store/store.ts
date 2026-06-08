import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import filterReducer from './filterSlice';
import mapReducer from './mapSlice';
import geoJsonReducer from './geoJsonSlice';
import roadReducer from './RoadSlice';

const roadPersistConfig = {
  key: 'road',
  storage,
  whitelist: ['roads'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  location: filterReducer,
  map: mapReducer,
  geoJson: geoJsonReducer,
  road: persistReducer(roadPersistConfig, roadReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;