import React, { useState, useEffect, useContext, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay } from "date-fns";
import styles from "./MoodCalendar.module.css";
import moods from "../../data/moods.js";
import { EntriesContext } from "../../contexts/EntriesContext.jsx";
import LoadingSpinner from "../loading/LoadingSpinner.jsx";

const moodColors = {
  great: moods[0].color,
  good: moods[1].color,
  meh: moods[2].color,
  bad: moods[3].color,
  awful: moods[4].color,
};

const MoodCalendar = () => {
  const { entries, displayedDate, setDisplayedDate } =
    useContext(EntriesContext);

  const [selectedDate, setSelectedDate] = useState(null);

  // build dayMoods map from context entries using useMemo
  const dayMoods = useMemo(() => {
    const map = {};
    entries.forEach((entry) => {
      map[format(new Date(entry.date), "yyyy-MM-dd")] =
        entry.mood.toLowerCase();
    });
    return map;
  }, [entries]); // only recalculate when entries change

  const handleDateChange = (date) => setSelectedDate(date);

  // sync calendar navigation with EntriesContext
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    if (activeStartDate) {
      setDisplayedDate(activeStartDate); // This will trigger EntriesContext to fetch new data
    }
  };

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
      <Calendar
        onChange={handleDateChange}
        value={selectedDate || displayedDate}
        activeStartDate={displayedDate}
        onActiveStartDateChange={handleActiveStartDateChange}
        tileContent={tileContent}
        formatDay={() => ""}
        className={styles.calendar}
      />
    </div>
  );
};

export default MoodCalendar;
