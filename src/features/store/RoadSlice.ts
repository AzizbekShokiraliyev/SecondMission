import type { Road, RoadState } from '@/interface/Interface';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: RoadState = {
  roads: [],
  activeRoadId: null,
};

const roadSlice = createSlice({
  name: 'road',
  initialState,
  reducers: {
    addRoad(state, action: PayloadAction<Road>) {
      state.roads.unshift(action.payload);
    },
    removeRoad(state, action: PayloadAction<string>) {
      state.roads = state.roads.filter((r) => r.id !== action.payload);
      if (state.activeRoadId === action.payload) {
        state.activeRoadId = null;
      }
    },
    setActiveRoad(state, action: PayloadAction<string | null>) {
      state.activeRoadId = action.payload;
    },
  },
});

export const { addRoad, removeRoad, setActiveRoad } = roadSlice.actions;
export default roadSlice.reducer;