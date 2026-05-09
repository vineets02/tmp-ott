// src/context/auth.js
import axios from "axios";
import { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ 
    user: null, 
    token: null, 
    activeProfile: null 
  });

  // Load once from localStorage (key = "auth")
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setAuth({
        user: parsed?.user ?? null,
        token: parsed?.token ?? null,
        activeProfile: parsed?.activeProfile ?? null,
      });
    } catch {
      // ignore bad JSON
    }
  }, []);

  // Persist and configure axios whenever auth state changes
  useEffect(() => {
    // persist
    localStorage.setItem("auth", JSON.stringify(auth));
    // axios header
    if (auth?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
