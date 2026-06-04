// src/features/store/mapSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Feature, LineString, Point } from "geojson";
import type { DirectionStep, MapState } from "@/interface/Interface";


const initialState: MapState = {
  selectedFeature: null,
  routeFrom: null,
  routeTo: null,
  routeGeometry: null,
  routeColor: '#378ADD',
  directionsInstructions: [],
  currentInstructionIndex: 0,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setSelectedFeature(state, action: PayloadAction<Feature | null>) {
      state.selectedFeature = action.payload;
    },
    setRouteFrom(state, action: PayloadAction<Feature<Point> | null>) {
      state.routeFrom = action.payload;
    },
    setRouteTo(state, action: PayloadAction<Feature<Point> | null>) {
      state.routeTo = action.payload;
    },
    setRouteGeometry(state, action: PayloadAction<Feature<LineString> | null>) {
      state.routeGeometry = action.payload;
    },
    setRouteColor(state, action: PayloadAction<string>) {
      state.routeColor = action.payload;
    },
    setDirectionsInstructions(state, action: PayloadAction<DirectionStep[]>) {
      state.directionsInstructions = action.payload;
      state.currentInstructionIndex = 0; 
    },
    setCurrentInstructionIndex(state, action: PayloadAction<number>) {
      state.currentInstructionIndex = action.payload;
    },
  },
});

export const {
  setSelectedFeature,
  setRouteFrom,
  setRouteTo,
  setRouteGeometry,
  setRouteColor,
  setDirectionsInstructions,
  setCurrentInstructionIndex,
} = mapSlice.actions;

export default mapSlice.reducer;