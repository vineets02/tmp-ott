import { createSlice } from "@reduxjs/toolkit";

const getInitialWatchlistState = () => {
  try {
    const raw = localStorage.getItem("watchlist");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const watchSlice = createSlice({
  name: "watchlist",
  initialState: getInitialWatchlistState(),
  reducers: {
    setWatchlist: (state, action) => {
      localStorage.setItem("watchlist", JSON.stringify(action.payload));
      return action.payload;
    },
    addToWatchlist: (state, action) => {
      const exists = state.find((item) => item._id === action.payload._id);
      if (!exists) {
        state.push(action.payload);
        localStorage.setItem("watchlist", JSON.stringify(state));
      }
    },
    removeFromWatchlist: (state, action) => {
      const updated = state.filter((item) => item._id !== action.payload);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      return updated;
    },
    clearWatchlist: () => {
      localStorage.removeItem("watchlist");
      return [];
    }
  },
});

export const { setWatchlist, addToWatchlist, removeFromWatchlist, clearWatchlist } = watchSlice.actions;
export default watchSlice.reducer;
