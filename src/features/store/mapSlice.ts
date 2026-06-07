import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Feature, LineString, Point } from 'geojson';
import type { DirectionStep, StoredRoute } from '@/interface/Interface';

export interface MapState {
  selectedFeature: Feature | null;
  routeGeometry: Feature<LineString> | null;        // qo‘shildi
  routeColor: string;
  directionsInstructions: DirectionStep[];
  selectedLocations: Feature[];
  // agar kerak bo‘lsa, qo‘shimcha maydonlar
  routeFrom: Feature<Point> | null;
  routeTo: Feature<Point> | null;
  routes: StoredRoute[];
  currentInstructionIndex: number;
}

const initialState: MapState = {
  selectedFeature: null,
  routeGeometry: null,
  routeColor: '#3b82f6', // default ko‘k
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
    // qo‘shimcha kerakli reducer'lar
    setRouteFrom(state, action: PayloadAction<Feature<Point> | null>) {
      state.routeFrom = action.payload;
    },
    setRouteTo(state, action: PayloadAction<Feature<Point> | null>) {
      state.routeTo = action.payload;
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
} = mapSlice.actions;

export default mapSlice.reducer;