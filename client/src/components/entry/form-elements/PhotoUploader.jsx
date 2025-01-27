import React, { useRef } from "react";
import PropTypes from "prop-types";
import styles from "./FormElements.module.css";

const PhotoUploader = ({ photo, setPhoto }) => {
  const fileInputRef = useRef(null);

  const handleTakePhoto = () => {
    // just triggering file input for now. TODO: implement camera functionality
    fileInputRef.current.click();
  };

  const handleAddFromGallery = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <div className={styles["photo-uploader"]}>
      <label className={styles.label}>
        <img
          src="src/assets/icons/entry/gallery.svg"
          alt=""
          className={styles["add-photo-icon"]}
        />
        Add Photo:
      </label>
      <div className={styles["button-group"]}>
        <button
          type="button"
          onClick={handleTakePhoto}
          className={styles["upload-button"]}
        >
          <img
            src="src/assets/icons/entry/photo.svg"
            alt=""
            className={styles["upload-icon"]}
          />
          Take Photo
        </button>
        <button
          type="button"
          onClick={handleAddFromGallery}
          className={styles["upload-button"]}
        >
          <img
            src="src/assets/icons/entry/gallery.svg"
            alt=""
            className={styles["upload-icon"]}
          />
          Add from Gallery
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex="-1"
      />
      {photo && (
        <div className={styles.preview}>
          <img
            src={URL.createObjectURL(photo)}
            alt="Preview"
            className={styles["preview-image"]}
          />
        </div>
      )}
    </div>
  );
};

PhotoUploader.propTypes = {
  photo: PropTypes.instanceOf(File),
  setPhoto: PropTypes.func.isRequired,
};

export default PhotoUploader;
