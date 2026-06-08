import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Feature } from 'geojson';

export const fetchGeoJson = createAsyncThunk('geoJson/fetch', async () => {
  const response = await fetch('/data/us-states.json');
  const data = await response.json();
  return data.features;
});

const geoJsonSlice = createSlice({
  name: 'geoJson',
  initialState: { data: [] as Feature[], loading: false },
  reducers: {
    addLocation: (state, action: PayloadAction<Feature>) => {
      state.data.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGeoJson.fulfilled, (state, action: PayloadAction<Feature[]>) => {
      state.data = action.payload;
    });
  },
});

export const { addLocation } = geoJsonSlice.actions;
export default geoJsonSlice.reducer;





// import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
// import type { Feature } from 'geojson';

// export const fetchGeoJson = createAsyncThunk('geoJson/fetch', async () => {
//   const response = await fetch('/data/us-states.json');
//   const data = await response.json();
//   return data.features;
// });

// const geoJsonSlice = createSlice({
//   name: 'geoJson',
//   initialState: { data: [] as Feature[], loading: false },
//   reducers: {
//     addLocation: (state, action: PayloadAction<Feature>) => {
//       state.data.push(action.payload);
//     },
//     removeLocation: (state, action: PayloadAction<number>) => {
//       state.data.splice(action.payload, 1);
//     },
//   },
//   extraReducers: (builder) => {
//     builder.addCase(fetchGeoJson.fulfilled, (state, action: PayloadAction<Feature[]>) => {
//       state.data = action.payload;
//     });
//   },
// });

// export const { addLocation, removeLocation } = geoJsonSlice.actions;
// export default geoJsonSlice.reducer;