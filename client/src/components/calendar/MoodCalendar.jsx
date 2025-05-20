import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { startOfMonth, endOfMonth, format, isSameDay } from "date-fns";
import styles from "./MoodCalendar.module.css";
import moods from "../../data/moods.js";
import axiosInstance from "../../utils/axiosInstance.js";
import { LoadingContext } from "../../contexts/LoadingContext.jsx";
import LoadingSpinner from "../loading/LoadingSpinner.jsx";

const moodColors = {
  great: moods[0].color,
  good: moods[1].color,
  meh: moods[2].color,
  bad: moods[3].color,
  awful: moods[4].color,
};

const MoodCalendar = () => {
  const { startLoading, finishLoading } = useContext(LoadingContext);
  const [dayMoods, setDayMoods] = useState({});
  const [activeDate, setActiveDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState(null);

  const fetchMoods = async (dateToFetch) => {
    startLoading();
    setError(null);
    try {
      const firstDay = startOfMonth(dateToFetch);
      const lastDay = endOfMonth(dateToFetch);
      const start = format(firstDay, "yyyy-MM-dd");
      const end = format(lastDay, "yyyy-MM-dd");
      const response = await axiosInstance.get("/moods", {
        params: { start, end },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const map = {};
      response.data.forEach((entry) => {
        map[format(new Date(entry.date), "yyyy-MM-dd")] =
          entry.mood.toLowerCase();
      });
      setDayMoods(map);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch moods");
    } finally {
      finishLoading();
    }
  };

  useEffect(() => {
    fetchMoods(activeDate);
  }, [activeDate]);

  const handleDateChange = (date) => setSelectedDate(date);

  const tileContent = ({ date: tileDate, view }) => {
    if (view !== "month") return null;
    const key = format(tileDate, "yyyy-MM-dd");
    const mood = dayMoods[key];
    const isToday = isSameDay(tileDate, new Date());
    const isSelected = selectedDate && isSameDay(tileDate, selectedDate);
    const baseCls = mood ? styles.dayCircle : styles.dayCircleEmpty;
    const className = `${baseCls} ${isToday ? styles.today : ""} ${isSelected ? styles.activeDay : ""}`;
    const style = moodColors[mood] ? { backgroundColor: moodColors[mood] } : {};
    return (
      <div className={className} style={style}>
        {tileDate.getDate()}
      </div>
    );
  };

  return (
    <div
      className={styles["calendar-container"]}
      style={{ position: "relative" }}
    >
      <LoadingSpinner />
      {error && <div className={styles.errorMessage}>Error: {error}</div>}
      <Calendar
        onChange={handleDateChange}
        value={selectedDate || activeDate}
        activeStartDate={activeDate}
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveDate(activeStartDate)
        }
        tileContent={tileContent}
        formatDay={() => ""}
        className={styles.calendar}
      />
    </div>
  );
};

export default MoodCalendar;
