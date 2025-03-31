import { useState } from 'react';
import styles from '../SettingsList.module.css'

const PushNotifications = ({ isOpen, onClose }) => {
    const [notificationsSettings, setNotificationsSettings] = useState({
        enabled: true,
        reminderTime: '20:00'
    })

    const handleToggle = () => {
        setNotificationsSettings(prev => ({
            ...prev,
            enabled: !prev.enabled
        }))
    }

    const handleTimeChange = (e) => {
        setNotificationsSettings(prev => ({
            ...prev,
            reminderTime: e.target.value
        }))
    }

    const handleSave = () => {
        //send to backend
        //close modal (or not)
    }

    // if (!isOpen) return null

    return (
        <div className={styles['push-notifications-container']}>
            <p className={styles['main-text']}>Let us remind you to check in with your feelings each day</p>
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
            aria-label='Save Button'
            >
                Save
            </button>

            <button className={styles['close-btn']} aria-label='Close Modal Button'>&times;</button>
        </div>
    );
};

export default PushNotifications;