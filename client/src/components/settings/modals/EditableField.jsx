import { useEffect, useRef, useState } from "react";
import styles from "../SettingsList.module.css";

const EditableField = ({ label, value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const wrapperRef = useRef(null);

  const inputId = `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isEditing &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setTempValue(value);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, value]);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  return (
    <div ref={wrapperRef} className={styles["editable-field-container"]}>
      <label htmlFor={inputId} className={styles["field-label"]}>
        {label}
      </label>
      <div className={styles["field-input-wrapper"]}>
        {isEditing ? (
          <input
            id={inputId}
            className={styles["editable-true"]}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            autoFocus
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={styles["editable-false"]}
          >
            {value}
          </span>
        )}
        <button
          className={styles["edit-btn"]}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
    </div>
  );
};

export default EditableField;
