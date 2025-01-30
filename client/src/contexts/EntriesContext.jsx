import { createContext, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export const EntriesContext = createContext(null)

export const EntriesProvider = ({ children }) => {
    const [entries, setEntries] = useState([])

    const addEntry = (newEntry) => {
        setEntries(prevEntries => [newEntry, ...prevEntries])
    }

    const refreshEntries = async () => {
        try {
            const response = await axiosInstance.get("/moods")
            console.log("Fetched moods: ", response.data)
            setEntries(response.data)
        } catch (error) {
            console.error("Failed to fetch entries: ", error)  
            setEntries([])
        }
    }
    return (
        <EntriesContext.Provider value={{entries, addEntry, refreshEntries}}>
            {children}
        </EntriesContext.Provider>
    )
}