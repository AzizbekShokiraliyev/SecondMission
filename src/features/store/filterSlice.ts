import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SortByType = 'area-asc' | 'area-desc' | null;

interface FilterState {
  sortBy: SortByType;
}

const initialState: FilterState = {
  sortBy: null,
};

const filterSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<SortByType>) {
      state.sortBy = action.payload;
    },
  },
});

export const { setSortBy } = filterSlice.actions;
export default filterSlice.reducer;