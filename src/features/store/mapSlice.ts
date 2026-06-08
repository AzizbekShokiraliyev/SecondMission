import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Feature, LineString, Point } from 'geojson';
import type { DirectionStep, MapState, StoredRoute } from '@/interface/Interface';

const initialState: MapState = {
  selectedFeature: null,
  routeGeometry: null,
  routeColor: '#3b82f6',
  directionsInstructions: [],
  selectedLocations: [],
  routeFrom: null,
  routeTo: null,
  routes: [],
  currentInstructionIndex: 0,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setSelectedFeature(state, action: PayloadAction<Feature | null>) {
      state.selectedFeature = action.payload;
    },
    setRouteGeometry(state, action: PayloadAction<Feature<LineString> | null>) {
      state.routeGeometry = action.payload;
    },
    setRouteColor(state, action: PayloadAction<string>) {
      state.routeColor = action.payload;
    },
    setDirectionsInstructions(state, action: PayloadAction<DirectionStep[]>) {
      state.directionsInstructions = action.payload;
    },
    setSelectedLocations(state, action: PayloadAction<Feature[]>) {
      state.selectedLocations = action.payload;
    },
    setRouteFrom(state, action: PayloadAction<Feature<Point> | null>) {
      state.routeFrom = action.payload;
    },
    setRouteTo(state, action: PayloadAction<Feature<Point> | null>) {
      state.routeTo = action.payload;
    },
    setRoutes(state, action: PayloadAction<StoredRoute[]>) {
      state.routes = action.payload;
    },
    setCurrentInstructionIndex(state, action: PayloadAction<number>) {
      state.currentInstructionIndex = action.payload;
    },
  },
});

export const {
  setSelectedFeature,
  setRouteGeometry,
  setRouteColor,
  setDirectionsInstructions,
  setSelectedLocations,
  setRouteFrom,
  setRouteTo,
  setRoutes,
  setCurrentInstructionIndex,
} = mapSlice.actions;

export default mapSlice.reducer;