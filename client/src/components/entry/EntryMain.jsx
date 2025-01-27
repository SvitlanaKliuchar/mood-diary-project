import React from "react";
import PropTypes from "prop-types";
import MultiSelectButtonGroup from "./form-elements/MultiSelectButtonGroup.jsx";
import styles from "./EntryForm.module.css";
import emotionsOptions from "../../data/emotions.js";
import sleepOptions from "../../data/sleep.js";
import productivityOptions from "../../data/productivity.js";
import NoteField from "./form-elements/NoteField.jsx";
import PhotoUploader from "./form-elements/PhotoUploader.jsx";

const EntryMain = ({
  emotions,
  setEmotions,
  sleep,
  setSleep,
  productivity,
  setProductivity,
  note,
  setNote,
  photo,
  setPhoto,
}) => {
  return (
    <div className={styles["entry-main"]}>
      <h1>What have you been up to?</h1>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Emotions</legend>
        <MultiSelectButtonGroup
          options={emotionsOptions}
          selectedOptions={emotions}
          setSelectedOptions={setEmotions}
        />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Sleep</legend>
        <MultiSelectButtonGroup
          options={sleepOptions}
          selectedOptions={sleep}
          setSelectedOptions={setSleep}
        />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Productivity</legend>
        <MultiSelectButtonGroup
          options={productivityOptions}
          selectedOptions={productivity}
          setSelectedOptions={setProductivity}
        />
      </fieldset>

      <NoteField note={note} setNote={setNote} />

      <PhotoUploader photo={photo} setPhoto={setPhoto} />
    </div>
  );
};

EntryMain.propTypes = {
  emotions: PropTypes.arrayOf(PropTypes.string).isRequired,
  setEmotions: PropTypes.func.isRequired,
  sleep: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSleep: PropTypes.func.isRequired,
  productivity: PropTypes.arrayOf(PropTypes.string).isRequired,
  setProductivity: PropTypes.func.isRequired,
  note: PropTypes.string.isRequired,
  setNote: PropTypes.func.isRequired,
  photo: PropTypes.instanceOf(File),
  setPhoto: PropTypes.func.isRequired,
};

export default EntryMain;
