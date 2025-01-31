import { createContext, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export const EntriesContext = createContext(null)

export const EntriesProvider = ({ children }) => {
    const [entries, setEntries] = useState([])
    const [displayedDate, setDisplayedDate] = useState(new Date())

    const addEntry = (newEntry) => {
        setEntries(prevEntries => [newEntry, ...prevEntries])
    }

    const refreshEntries = async () => {
        try {
        const startOfMonth = new Date(Date.UTC(displayedDate.getFullYear(), displayedDate.getMonth(), 1));
        
        const endOfMonth = new Date(Date.UTC(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 0, 23, 59, 59, 999));

            const response = await axiosInstance.get("/moods", {
                params: {
                    start: startOfMonth.toISOString(),
                    end: endOfMonth.toISOString()
                }
            })
            setEntries(response.data)
        } catch (error) {
            console.error("Failed to fetch entries: ", error)  
            setEntries([])
        }
    }
    return (
        <EntriesContext.Provider value={{entries, addEntry, refreshEntries, displayedDate, setDisplayedDate}}>
            {children}
        </EntriesContext.Provider>
    )
}