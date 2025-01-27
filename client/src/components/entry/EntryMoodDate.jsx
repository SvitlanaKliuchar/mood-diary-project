import React from "react";
import styles from "./Entry.module.css";
import DatePickerComponent from "./form-elements/DatePickerComponent.jsx"
import MoodSelector from "./form-elements/MoodSelector.jsx";
import PropTypes from 'prop-types';


const EntryMoodDate = ({ mood, setMood, date, setDate }) => {
  return (
    <fieldset className={styles['entry-header']}>
      <h1 className={styles.title}>How are you?</h1>

      <div className={styles['date-picker-container']}>
        <img className={styles['calendar-icon']} src="src/assets/icons/other/calendar-icon.svg" alt="" />
        <DatePickerComponent selectedDate={date} onDateChange={setDate} />
      </div>

      <div className={styles['mood-options-container']}>
        <MoodSelector mood={mood} setMood={setMood} />
      </div>
    </fieldset>
  );
};


EntryMoodDate.propTypes = {
  date: PropTypes.instanceOf(Date),
  setDate: PropTypes.func.isRequired,
  mood: PropTypes.string.isRequired,
  setMood: PropTypes.func.isRequired,
};

export default EntryMoodDate;
