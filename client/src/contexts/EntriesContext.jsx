import { createContext, useContext, useState, useEffect, useCallback } from "react"; 
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "./AuthContext";

export const EntriesContext = createContext(null);

export const EntriesProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [displayedDate, setDisplayedDate] = useState(new Date());
  const { user } = useContext(AuthContext);

  const addEntry = (newEntry) => {
    setEntries((prevEntries) => [newEntry, ...prevEntries]);
  };

  // wrap refreshEntries in useCallback to prevent recreation
  const refreshEntries = useCallback(async () => {
    try {
      const startOfMonth = new Date(
        Date.UTC(displayedDate.getFullYear(), displayedDate.getMonth(), 1),
      );
      const endOfMonth = new Date(
        Date.UTC(
          displayedDate.getFullYear(),
          displayedDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
      );
      
      const response = await axiosInstance.get("/moods", {
        params: {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString(),
        },
      });
      
      setEntries(response.data);
    } catch (error) {
      console.error("Failed to fetch entries: ", error);
      setEntries([]);
    }
  }, [displayedDate]); 

  // now refreshEntries is stable and included in dependencies
  useEffect(() => {
    if (user) {
      refreshEntries();
    }
  }, [user, refreshEntries]); 

  const updateEntry = async (id, formData) => {
    try {
      const response = await axiosInstance.put(`/moods/${id}`, formData);
      
      // update the entries state with modified entry
      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === id ? response.data.mood : entry,
        ),
      );
      
      return response.data;
    } catch (error) {
      console.error("Failed to update entry: ", error);
      throw error;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await axiosInstance.delete(`/moods/${id}`);
      
      // remove the deleted entry from the entries state
      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== id),
      );
    } catch (error) {
      console.error("Failed to delete entry: ", error);
      throw error;
    }
  };

  return (
    <EntriesContext.Provider
      value={{
        entries,
        addEntry,
        refreshEntries, 
        displayedDate,
        setDisplayedDate,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
};