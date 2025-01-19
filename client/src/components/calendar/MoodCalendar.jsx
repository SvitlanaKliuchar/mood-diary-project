import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns";
import axios from "axios";
import styles from "./MoodCalendar.module.css";

const MOOD_COLORS = {
  rad: "#7cc576",
  good: "#a4d47f",
  meh: "#70cce1",
  bad: "#b39ddb",
  awful: "#ef9a9a",
};

// Define default moods for prototyping
const defaultMoods = {
  "2025-01-01": "rad",
  "2025-01-02": "good",
  "2025-01-03": "meh",
  "2025-01-04": "bad",
  "2025-01-05": "awful",
  "2025-01-06": "rad",
  "2025-01-07": "good",
  // Add more defaults as necessary for demonstration
};

const MoodCalendar = ({ userId }) => {
  // Initialize dayMoods with default moods
  const [dayMoods, setDayMoods] = useState(defaultMoods);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const monthIndex = date.getMonth(); // 0-based month index
  const year = date.getFullYear();
  const month = monthIndex + 1; // 1-based month for API call if needed

  // Fetch mood data whenever the visible month/year changes
  useEffect(() => {
    async function fetchMoods() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/moods", {
          params: { year, month, userId },
        });
        // Overwrite default moods with fetched data if available
        setDayMoods(response.data || defaultMoods);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        // Keep default moods on error
      } finally {
        setLoading(false);
      }
    }
    fetchMoods();
  }, [year, month, userId]);

  const firstDayOfMonth = startOfMonth(new Date(year, monthIndex));
  const lastDayOfMonth = endOfMonth(firstDayOfMonth);
  const allDays = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingWeekday = getDay(firstDayOfMonth);
  const shiftForMondayStart = (startingWeekday + 6) % 7;
  const blanksBefore = Array(shiftForMondayStart).fill(null);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const calendarDays = [...blanksBefore, ...allDays];
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  function getMoodColor(date) {
    if (!date) return null;
    // Defensive check if dayMoods becomes undefined
    if (!dayMoods) return null;
    const key = format(date, "yyyy-MM-dd");
    const mood = dayMoods[key];
    return mood ? MOOD_COLORS[mood] || "#cccccc" : null;
  }

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const color = getMoodColor(date);
    if (!color) return null;

    return (
      <div className={styles.dayCircle} style={{ backgroundColor: color }}>
        {date.getDate()}
      </div>
    );
  };

  if (loading) return <div>Loading calendar...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles["calendar-container"]}>
      <Calendar onChange={setDate} value={date} tileContent={tileContent} />
    </div>
  );
};

export default MoodCalendar;
