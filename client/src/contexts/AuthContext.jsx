import React, { createContext, useState, useEffect } from "react";
import axiosInstance, { setupInterceptors } from "../utils/axiosInstance.js";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      if (res.status === 200) {
        setUser(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error logging out:", err);
      return false;
    }
  };

  useEffect(() => {
    setupInterceptors({ logout });

    (async () => {
      try {
        const { data } = await axiosInstance.get("/auth/me");
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Error fetching user:", err);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (credentials) => {
    try {
      const { data, status } = await axiosInstance.post(
        "/auth/login",
        credentials,
        { headers: { "Content-Type": "application/json" } }
      );

      if (status === 200 && data?.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error during login:", err);
      return false;
    }
  };

  const register = async (credentials) => {
    try {
      const { data, status } = await axiosInstance.post(
        "/auth/register",
        credentials,
        { headers: { "Content-Type": "application/json" } }
      );
      if (status === 201 && data?.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error during registration:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
