// MultiSelectButtonGroup.jsx
import React from "react";
import PropTypes from "prop-types";
import styles from "./FormElements.module.css";

const MultiSelectButtonGroup = ({
  options,
  selectedOptions,
  setSelectedOptions,
}) => {
  const handleToggle = (value) => {
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== value));
    } else {
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  return (
    <div
      role="group"
      aria-labelledby="option-selector"
      className={styles["options"]}
    >
      <span id="option-selector" className="sr-only">
        Select options for emotions, sleep, productivity
      </span>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`${styles["option-button"]} ${
            selectedOptions.includes(option.value) ? styles.selected : ""
          }`}
          onClick={() => handleToggle(option.value)}
          aria-pressed={selectedOptions.includes(option.value)}
        >
          <img
            className={styles["option-icon"]}
            src={option.iconUrl}
            alt={option.label}
          />
          <span className={styles["option-value"]}>{option.value}</span>
        </button>
      ))}
    </div>
  );
};

MultiSelectButtonGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedOptions: PropTypes.func.isRequired,
};

export default MultiSelectButtonGroup;
