import type { GeoJsonState } from '@/interface/Interface';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Feature } from 'geojson';

export const fetchGeoJson = createAsyncThunk('geoJson/fetch', async () => {
  const response = await fetch('/data/us-states.json');
  const data = await response.json();
  return data.features as Feature[];
});

const initialState: GeoJsonState = {
  baseFeatures: [],
  customLocations: [],
  loading: false,
  data: [],
};

const geoJsonSlice = createSlice({
  name: 'geoJson',
  initialState,
  reducers: {
    addLocation(state, action: PayloadAction<Feature>) {
      state.customLocations.push(action.payload);
      state.data = [...state.baseFeatures, ...state.customLocations];
    },
    removeLocation(state, action: PayloadAction<string>) {
      state.customLocations = state.customLocations.filter(
        (f) => f.properties?.name !== action.payload
      );
      state.data = [...state.baseFeatures, ...state.customLocations];
    },
    rehydrateData(state) {
      state.data = [...state.baseFeatures, ...state.customLocations];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeoJson.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGeoJson.fulfilled, (state, action: PayloadAction<Feature[]>) => {
        state.loading = false;
        state.baseFeatures = action.payload;
        state.data = [...action.payload, ...state.customLocations];
      })
      .addCase(fetchGeoJson.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addLocation, removeLocation, rehydrateData } = geoJsonSlice.actions;
export default geoJsonSlice.reducer;