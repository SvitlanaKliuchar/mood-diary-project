import { useContext, useEffect, useState } from "react";
import styles from "../SettingsList.module.css";
import axiosInstance from "../../../utils/axiosInstance";
import { AuthContext } from "../../../contexts/AuthContext";
import { LoadingContext } from "../../../contexts/LoadingContext.jsx";
import LoadingSpinner from "../../loading/LoadingSpinner.jsx";

const PushNotifications = ({ onClose }) => {
  const [notificationsSettings, setNotificationsSettings] = useState({
    enabled: true,
    reminderTime: "20:00",
  });
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const { startLoading, finishLoading } = useContext(LoadingContext);

  useEffect(() => {
    if (!user?.id) return;
    startLoading();

    const fetchCurrentSettings = async () => {
      try {
        const response = await axiosInstance.get(`/settings/${user.id}`);
        setNotificationsSettings({
          enabled: response.data?.notificationsEnabled ?? false,
          reminderTime: response.data?.notifyTime ?? "20:00",
        });
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Could not load settings");
      } finally {
        finishLoading();
      }
    };

    if (user?.id) {
      fetchCurrentSettings();
    }
  }, [user]);

  const handleToggle = () => {
    setNotificationsSettings((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  const handleTimeChange = (e) => {
    setNotificationsSettings((prev) => ({
      ...prev,
      reminderTime: e.target.value,
    }));
  };

  const handleSave = async () => {
    startLoading();
    try {
      const response = await axiosInstance.patch(`/settings/${user.id}`, {
        notificationsEnabled: notificationsSettings.enabled,
        notifyTime: notificationsSettings.reminderTime,
      });
      console.log("Settings updated:", response.data);
      onClose();
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Error updating settings");
    } finally {
      finishLoading();
    }
  };
  if (error) return <p>{error}</p>;

  return (
    <div className={styles["settings-list"]}>
      <LoadingSpinner />
      <button
        onClick={onClose}
        className={styles["back-btn"]}
        aria-label="Back"
      >
        ←
      </button>
      <div className={styles["push-notifications-container"]}>
        <p id="push-notifications-title" className={styles["main-text"]}>
          Let us remind you to check in with your feelings each day
        </p>

        <label className={styles["input-label"]}>
          <input
            type="checkbox"
            checked={notificationsSettings.enabled}
            onChange={handleToggle}
            className={styles["toggle-input"]}
          />
          <span className={styles["toggle-switch"]}></span>
          Enable Daily Reminders
        </label>

        <label className={styles["input-label"]}>
          Reminder Time:
          <input
            className={styles["time-input"]}
            type="time"
            value={notificationsSettings.reminderTime}
            onChange={handleTimeChange}
            disabled={!notificationsSettings.enabled}
          />
        </label>

        <button
          onClick={handleSave}
          className={styles["save-btn"]}
          aria-label="Save Button"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PushNotifications;
