import React, { useState } from "react";
import styles from "./Entry.module.css";
import DatePickerComponent from "./DatePickerComponent.jsx"
import moods from "../../data/moods.js"

const EntryHeader = () => {
  const [date, setDate] = useState(new Date());
  const [mood, setMood] = useState("");

  const handleMoodChange = (newMood) => {
    setMood(newMood);
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  return (
    <header className={styles['entry-header']}>
      <h1 className={styles.title}>How are you?</h1>

      <div className={styles['date-picker-container']}>
        <img className={styles['calendar-icon']} src="src/assets/icons/other/calendar-icon.svg" alt="" />
        <DatePickerComponent selectedDate={date} onDateChange={handleDateChange} />
      </div>

      <div className={styles['mood-options']}>
        {moods.map((moodOption) => (
          <button
            type="button"
            key={moodOption.value}
            className={`${styles['mood-button']} ${mood.toLowerCase() === moodOption.value ? styles.selected : ''}`}
            onClick={() => handleMoodChange(moodOption.value)}
            aria-pressed={mood.toLowerCase() === moodOption.value}
          >
            <img className={styles['mood-emoji']} src={moodOption.iconUrl} alt={moodOption.label} />
            {moodOption.value}
          </button>
        ))}
      </div>

    </header>
  );
};

export default EntryHeader;
