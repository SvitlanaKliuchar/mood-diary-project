import React from "react";
import PropTypes from "prop-types";
import styles from "./FormElements.module.css";
import { FaCheck } from "react-icons/fa";

const SubmitButton = () => {
  return (
    <div className={styles["submit"]}>
      <button
        type="submit"
        className={styles["submit-button"]}
      >
        <FaCheck className={styles["check-icon"]} aria-hidden="true" />
      </button>
      <span className={styles.text}>Save</span>
    </div>
  );
};

export default SubmitButton;
