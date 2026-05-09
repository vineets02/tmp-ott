import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    keyword: "",
    results: [],
  },
  reducers: {
    setSearch: (state, action) => {
      state.keyword = action.payload.keyword ?? state.keyword;
      state.results = action.payload.results ?? state.results;
    },
    clearSearch: (state) => {
      state.keyword = "";
      state.results = [];
    }
  },
});

export const { setSearch, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
