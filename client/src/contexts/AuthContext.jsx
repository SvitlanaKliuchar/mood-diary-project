import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      console.log("Cached user data:", cachedUser);
      setUser(JSON.parse(cachedUser));
      setLoading(false);
    } else {
      const checkUser = async () => {
        try {
          const { data } = await axios.get("/api/auth/me", {
            withCredentials: true,
          });
          if (data?.user) {
            console.log(
              "User data was fetched successfully and is now goint to be stored in localStorage",
              data.user,
            );
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            console.log("No user logged in (401)");
          } else {
            console.error("Error checking user data: ", err.message);
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
      const { data, status } = await axios.post(
        "/api/auth/login",
        credentials,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (status === 200 && data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
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
      const { data, status } = await axios.post(
        "/api/auth/register",
        credentials,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (status === 201 && data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
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
      const res = await axios.post(
        "/api/auth/logout",
        {},
        { withCredentials: true },
      );
      if (res.status === 200) {
        setUser(null);
        localStorage.removeItem("user");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error during user logout: ", err);
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
