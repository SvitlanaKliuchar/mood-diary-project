import React from "react";
import PropTypes from "prop-types";
import styles from "./FormElements.module.css";
import noteIcon from '../../../assets/icons/entry/note.svg'

const NoteField = ({ note, setNote }) => {
  return (
    <div className={styles["note-field"]}>
      <label htmlFor="quick-note" className={styles.label}>
        <img
          src={noteIcon}
          alt=""
          className={styles["note-icon"]}
        />
        Quick Note:
      </label>
      <textarea
        id="quick-note"
        name="quick-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add Note..."
        className={styles.textarea}
      />
    </div>
  );
};

NoteField.propTypes = {
  note: PropTypes.string.isRequired,
  setNote: PropTypes.func.isRequired,
};

export default NoteField;
