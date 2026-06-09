import type { Road, RoadState, DirectionStep } from '@/interface/Interface';
import type { Feature, LineString } from 'geojson';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: RoadState = {
  roads: [],
  activeRoadId: null,
  selectedRoadIds: [],
};

const roadSlice = createSlice({name: 'road', initialState, reducers: { addRoad(state, action: PayloadAction<Road>) {
      state.roads.unshift(action.payload);
    },
    
    removeRoad(state, action: PayloadAction<string>) {
      state.roads = state.roads.filter((r) => r.id !== action.payload);
      if (state.activeRoadId === action.payload) {state.activeRoadId = null}
      state.selectedRoadIds = state.selectedRoadIds.filter((id) => id !== action.payload);
    },

    setActiveRoad(state, action: PayloadAction<string | null>) {
      state.activeRoadId = action.payload;
    },

    toggleSelectedRoad(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.selectedRoadIds.indexOf(id);
      if (idx >= 0) {state.selectedRoadIds.splice(idx, 1);
      } else {
        state.selectedRoadIds.push(id);
      }
    },

    clearSelectedRoads(state) {state.selectedRoadIds = []},

    cacheRoute(state, action: PayloadAction<{
        roadId: string;
        geometry: Feature<LineString>;
        steps: DirectionStep[];
      }>
    ) {
      const road = state.roads.find((r) => r.id === action.payload.roadId);
      if (road) {
        road.cachedGeometry = action.payload.geometry;
        road.cachedSteps = action.payload.steps;
      }
    },
  },
});

export const {
  addRoad,
  removeRoad,
  setActiveRoad,
  toggleSelectedRoad,
  clearSelectedRoads,
  cacheRoute,
} = roadSlice.actions;

export default roadSlice.reducer;