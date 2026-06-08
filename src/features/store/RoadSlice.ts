import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Faqat zarur ma'lumotlarni saqlaymiz — butun Feature emas
export interface RoadPoint {
  name: string;
  centroid: [number, number]; // [lng, lat]
}

export interface Road {
  id: string;
  name: string;
  from: RoadPoint;
  to: RoadPoint;
  color: string;
  createdAt: number;
}

interface RoadState {
  roads: Road[];
  activeRoadId: string | null;
}

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