import type { FilterState } from "@/interface/Interface";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: FilterState = {
  searchQuery: "",
  sortBy: "",
};

export const filterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
        state.searchQuery = action.payload;
    },
        setSortBy: (state, action: PayloadAction<string>) => {
        state.sortBy = action.payload;
    },
    }
})

export const { setSearchQuery, setSortBy } = filterSlice.actions;
export default filterSlice.reducer;