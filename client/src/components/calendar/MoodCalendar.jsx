import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  startOfMonth,
  endOfMonth,
  format,
  isSameDay
} from "date-fns";
import styles from "./MoodCalendar.module.css";
import moods from '../../data/moods.js'
import axiosInstance from "../../utils/axiosInstance.js";

const moodColors = {
  great: moods[0].color,
  good: moods[1].color,
  meh: moods[2].color,
  bad: moods[3].color,
  awful: moods[4].color,
};

const MoodCalendar = () => {
  const [dayMoods, setDayMoods] = useState({});
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    async function fetchMoods() {
      setLoading(true);
      setError(null);
      try {
        // get first and last day of the visible month for API filtering
        const firstDay = startOfMonth(date);
        const lastDay = endOfMonth(date);
        
        // format dates for API
        const start = format(firstDay, "yyyy-MM-dd");
        const end = format(lastDay, "yyyy-MM-dd");
        
        const response = await axiosInstance.get("/moods", {
          params: { start, end },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // process the API response to map dates to moods
        const moodMap = {};
        response.data.forEach(entry => {
          const dateKey = format(new Date(entry.date), "yyyy-MM-dd");
          moodMap[dateKey] = entry.mood.toLowerCase();
        });
        
        setDayMoods(moodMap);
      } catch (err) {
        console.error("Error fetching mood data:", err);
        setError(err.response?.data?.message || "Failed to fetch mood data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchMoods();
  }, [date]); // re-fetch when the displayed month changes

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedDate(newDate);
  };

  // render the days with custom styling
  const tileContent = ({ date: tileDate, view }) => {
    if (view !== "month") return null;
    
    const dateKey = format(tileDate, "yyyy-MM-dd");
    const mood = dayMoods[dateKey];
    const isToday = isSameDay(tileDate, new Date());
    const isSelected = selectedDate && isSameDay(tileDate, selectedDate);
    
    // handle days with mood entries
    if (mood && moodColors[mood]) {
      return (
        <div 
          className={`${styles.dayCircle} ${isToday ? styles.today : ''} ${isSelected ? styles.activeDay : ''}`} 
          style={{ backgroundColor: moodColors[mood] }}
        >
          {tileDate.getDate()}
        </div>
      );
    }
    
    // non-mood days still need a consistent structure
    return (
      <div 
        className={`${styles.dayCircleEmpty} ${isToday ? styles.today : ''} ${isSelected ? styles.activeDay : ''}`}
      >
        {tileDate.getDate()}
      </div>
    );
  };

  if (loading && Object.keys(dayMoods).length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        Loading calendar...
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>Error: {error}</div>;
  }

  return (
    <div className={styles["calendar-container"]}>
      <Calendar
        onChange={handleDateChange}
        value={date}
        tileContent={tileContent}
        formatDay={() => ""} 
        className={styles.calendar}
      />
    </div>
  );
};

export default MoodCalendar;