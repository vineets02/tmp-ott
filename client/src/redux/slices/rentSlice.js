import { createSlice } from "@reduxjs/toolkit";

const getInitialRentState = () => {
  try {
    const raw = localStorage.getItem("rent");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const rentSlice = createSlice({
  name: "rent",
  initialState: getInitialRentState(),
  reducers: {
    setRent: (state, action) => {
      localStorage.setItem("rent", JSON.stringify(action.payload));
      return action.payload;
    },
    addToRent: (state, action) => {
      const exists = state.find((item) => item._id === action.payload._id);
      if (!exists) {
        state.push(action.payload);
        localStorage.setItem("rent", JSON.stringify(state));
      }
    },
    removeFromRent: (state, action) => {
      const updated = state.filter((item) => item._id !== action.payload);
      localStorage.setItem("rent", JSON.stringify(updated));
      return updated;
    },
    clearRent: () => {
      localStorage.removeItem("rent");
      return [];
    }
  },
});

export const { setRent, addToRent, removeFromRent, clearRent } = rentSlice.actions;
export default rentSlice.reducer;
