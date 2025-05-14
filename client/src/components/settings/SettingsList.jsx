import styles from './SettingsList.module.css'
import React, { useState } from 'react';
import DeleteAccount from './modals/DeleteAccount.jsx';
import ExportData from './modals/ExportData.jsx';
import PushNotifications from './modals/PushNotifications.jsx';
import ProfileInfo from './modals/ProfileInfo.jsx';
import Gallery from './modals/Gallery.jsx';

const SettingsList = () => {
    const [darkMode, setDarkMode] = useState(false)
    const [activePanel, setActivePanel] = useState(null)

    const handleToggle = (e) => {
        setDarkMode(e.target.checked)
        //update app theme context
    }

    return (
        <div className={styles['settings-container']}>
            {!activePanel && (
                <ul className={styles['settings-list']}>
                    <li>
                        <h2>Profile & Account Management</h2>
                        <ul className={styles.profile}>
                            <li><button onClick={() => setActivePanel('profile')}>Personal Info</button></li>
                            <li><button onClick={() => setActivePanel('delete')}>Delete Account</button></li>
                            <li><button onClick={() => setActivePanel('export')}>Export/Import Data</button></li>
                            <li><button onClick={() => setActivePanel('gallery')}>Gallery</button></li>
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
                            <li><button onClick={() => setActivePanel('push')}>Push Notifications</button></li>
                        </ul>
                    </li>
                </ul>
            )}
    
            {activePanel === 'profile' && <ProfileInfo onClose={() => setActivePanel(null)} />}
            {activePanel === 'delete' && <DeleteAccount onClose={() => setActivePanel(null)} />}
            {activePanel === 'export' && <ExportData onClose={() => setActivePanel(null)} />}
            {activePanel === 'push' && <PushNotifications onClose={() => setActivePanel(null)} />}
            {activePanel === 'gallery' && <Gallery onClose={() => setActivePanel(null)} />}

        </div>
    );
    
};

export default SettingsList;