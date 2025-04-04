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
        localStorage.removeItem("user");
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

    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setLoading(false);
    } else {
      const checkUser = async () => {
        try {
          const { data } = await axiosInstance.get("/auth/me");
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            console.log("No user logged in");
          } else {
            console.error("Error checking user data:", err.message);
          }
        } finally {
          setLoading(false);
        }
      };
      checkUser();
    }
  }, []);

  const login = async (credentials) => {
    try {
      const { data, status } = await axiosInstance.post(
        "/auth/login",
        credentials,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (status === 200 && data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
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
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      if (status === 201 && data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
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
