import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //check if user is already authenticated on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error checking user data: ", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (credentials) => {
    try {
      const { data, status } = await axios.post("/api/auth/login", credentials, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      if (status === 200 && data?.user) {
        setUser(data.user);
        return true;
      } else {
        console.error("Login failed: Unexpected response", data);
        return false;
      }
    } catch (err) {
      console.error("Error during login: ", err);
      return false;
    }
  };

  const register = async (credentials) => {
    try {
      const { data, status } = await axios.post("/api/auth/register", credentials, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      if (status === 201 && data?.user) {
        setUser(data.user);
        return true;
      } else {
        console.error("Registration failed: Unexpected response", data);
        return false;
      }
    } catch (err) {
      console.error("Error during registration: ", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error("Error during user logout: ", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
