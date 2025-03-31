import styles from './SettingsList.module.css'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DeleteAccount from './modals/DeleteAccount.jsx';
import ExportData from './modals/ExportData.jsx';
import PushNotifications from './modals/PushNotifications.jsx';
import ProfileInfo from './modals/ProfileInfo.jsx';

const SettingsList = () => {
    const [darkMode, setDarkMode] = useState(false)

    const handleToggle = (e) => {
        setDarkMode(e.target.checked)
        //update app theme context
    }

    return (
        <nav className={styles['settings-container']} aria-label='Settings Navigation'>
            <ul className={styles['settings-list']}>
                <li>
                    <h2>Profile & Account Management</h2>
                    <ul className={styles.profile}>
                        <li>
                            {/* (Name, avatar, email, change password) */}
                            <Link to="/profile">Personal Info</Link>
                        </li>
                        <li>
                            <Link to="/account/delete">Delete Account</Link>
                        </li>
                        <li>
                            <Link to="/account/export">Export/Import Data</Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <h2>Theme & Appearance</h2>
                    <div className={styles['toggle-container']}>
                        <label className={styles['toggle-label']}>
                            Dark Mode
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={handleToggle}
                                className={styles['toggle-input']}
                            />
                            <span className={styles['toggle-switch']}></span>
                        </label>
                    </div>
                </li>
                <li>
                    <h2>Notifications & Reminders</h2>
                    <ul className={styles.notifications}>
                        <li>
                            <Link to="/notifications/push">Push Notifications</Link>
                        </li>
                    </ul>
                </li>

            </ul>
          
            <ProfileInfo />
        </nav>
    );
};

export default SettingsList;