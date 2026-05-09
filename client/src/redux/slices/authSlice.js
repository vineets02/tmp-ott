import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.headers.common["bypass-tunnel-reminder"] = "true";

// Helper to set or remove axios token
const setAxiosToken = (token) => {
  axios.defaults.headers.common["bypass-tunnel-reminder"] = "true"; // Bypass localtunnel warning
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

const getInitialAuthState = () => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return { user: null, token: null, activeProfile: null };
    const parsed = JSON.parse(raw);
    if (parsed?.token) setAxiosToken(parsed.token);
    return {
      user: parsed?.user ?? null,
      token: parsed?.token ?? null,
      activeProfile: parsed?.activeProfile ?? null,
    };
  } catch {
    return { user: null, token: null, activeProfile: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.activeProfile !== undefined) {
        state.activeProfile = action.payload.activeProfile;
      }
      localStorage.setItem("auth", JSON.stringify(state));
      setAxiosToken(state.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.activeProfile = null;
      localStorage.removeItem("auth");
      setAxiosToken(null);
    },
    updateProfile: (state, action) => {
      state.activeProfile = action.payload;
      localStorage.setItem("auth", JSON.stringify(state));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("auth", JSON.stringify(state));
    }
  },
});

export const { setAuth, logout, updateProfile, updateUser } = authSlice.actions;
export default authSlice.reducer;
