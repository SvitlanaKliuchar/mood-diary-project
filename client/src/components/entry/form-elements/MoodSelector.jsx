import React from "react";
import PropTypes from "prop-types";
import moods from "../../../data/moods.js";
import styles from "../EntryForm.module.css";

const MoodSelector = ({ mood, setMood }) => {
  return (
    <div
      role="radiogroup"
      aria-labelledby="mood-selector"
      className={styles["mood-options"]}
    >
      <span id="mood-selector" className="sr-only">
        Select your mood
      </span>
      {moods.map((moodOption) => (
        <button
          type="button"
          key={moodOption.value}
          className={`${styles["mood-button"]} ${
            mood === moodOption.value ? styles.selected : ""
          }`}
          onClick={() => setMood(moodOption.value)}
          aria-pressed={mood === moodOption.value}
          role="radio"
          aria-checked={mood === moodOption.value}
        >
          <img
            className={styles["mood-emoji"]}
            src={moodOption.iconUrl}
            alt={moodOption.label}
          />
          <span className={styles.mood}>{moodOption.value}</span>
        </button>
      ))}
    </div>
  );
};

MoodSelector.propTypes = {
  mood: PropTypes.string.isRequired,
  setMood: PropTypes.func.isRequired,
};

export default MoodSelector;
