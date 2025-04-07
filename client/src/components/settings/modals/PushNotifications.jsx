import { useState } from 'react';
import styles from '../SettingsList.module.css';

const PushNotifications = ({ onClose }) => {
  const [notificationsSettings, setNotificationsSettings] = useState({
    enabled: true,
    reminderTime: '20:00',
  });

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

  const handleSave = () => {
    //  call the API here
    onClose(); 
  };

  return (
    <div className={styles['settings-list']}>
            <button onClick={onClose} className={styles['back-btn']} aria-label="Back">
                ←
            </button>
      <div className={styles['push-notifications-container']}>
        <p id="push-notifications-title" className={styles['main-text']}>
          Let us remind you to check in with your feelings each day
        </p>

        <label className={styles['input-label']}>
          <input
            type="checkbox"
            checked={notificationsSettings.enabled}
            onChange={handleToggle}
            className={styles['toggle-input']}
          />
          <span className={styles['toggle-switch']}></span>
          Enable Daily Reminders
        </label>

        <label className={styles['input-label']}>
          Reminder Time:
          <input
            className={styles['time-input']}
            type="time"
            value={notificationsSettings.reminderTime}
            onChange={handleTimeChange}
            disabled={!notificationsSettings.enabled}
          />
        </label>

        <button
          onClick={handleSave}
          className={styles['save-btn']}
          aria-label="Save Button"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PushNotifications;
