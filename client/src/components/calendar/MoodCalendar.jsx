import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { startOfMonth, endOfMonth, format, isSameDay } from "date-fns";
import styles from "./MoodCalendar.module.css";
import moods from '../../data/moods.js';
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
  const [activeDate, setActiveDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMoods = async (startDate) => {
    setLoading(true);
    setError(null);
    try {
      const firstDay = startOfMonth(startDate);
      const lastDay = endOfMonth(startDate);
      const start = format(firstDay, "yyyy-MM-dd");
      const end = format(lastDay, "yyyy-MM-dd");

      const response = await axiosInstance.get("/moods", {
        params: { start, end },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const moodMap = {};
      response.data.forEach(entry => {
        const key = format(new Date(entry.date), "yyyy-MM-dd");
        moodMap[key] = entry.mood.toLowerCase();
      });
      setDayMoods(moodMap);
    } catch (err) {
      console.error("Error fetching mood data:", err);
      setError(err.response?.data?.message || "Failed to fetch mood data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods(activeDate);
  }, [activeDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const tileContent = ({ date: tileDate, view }) => {
    if (view !== "month") return null;
    const dateKey = format(tileDate, "yyyy-MM-dd");
    const mood = dayMoods[dateKey];
    const isToday = isSameDay(tileDate, new Date());
    const isSelected = selectedDate && isSameDay(tileDate, selectedDate);

    const className = mood
      ? `${styles.dayCircle} ${isToday ? styles.today : ""} ${isSelected ? styles.activeDay : ""}`
      : `${styles.dayCircleEmpty} ${isToday ? styles.today : ""} ${isSelected ? styles.activeDay : ""}`;

    const style = mood && moodColors[mood]
      ? { backgroundColor: moodColors[mood] }
      : {};

    return (
      <div className={className} style={style}>
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
        value={selectedDate || activeDate}
        activeStartDate={activeDate}
        onActiveStartDateChange={({ activeStartDate }) => {
          setActiveDate(activeStartDate);
        }}
        tileContent={tileContent}
        formatDay={() => ""}
        className={styles.calendar}
      />
    </div>
  );
};

export default MoodCalendar;
