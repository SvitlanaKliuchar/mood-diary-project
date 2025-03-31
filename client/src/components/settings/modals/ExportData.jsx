import { useState } from 'react';
import styles from '../SettingsList.module.css'

const ExportData = ({isOpen, onClose}) => {
    const [password, setPassword] = useState('')
    const [isExporting, setIsExporting] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsExporting(true)
    }

    // if (!isOpen) return null

    return (
        <div className={styles['export-data-container']}>
            <p className={styles['main-text']}>Download a copy of your data for backup or to transfer to another service</p>                        
            <form action="" onSubmit={handleSubmit}>
                            <label htmlFor="password" className={styles['input-label']}>Enter password:</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </form>
                        <button
                            className={styles['export-data-btn']}
                            aria-label='Export Data Button'
                            type='submit'
                            disabled={isExporting}>
                            {isExporting ? 'Exporting...' : 'Export Data'}
                        </button>
                        <p className={styles.tip}>The import feature is coming soon!</p>
                        <button className={styles['close-btn']} aria-label='Close Modal Button'>&times;</button>
        </div>
    );
};

export default ExportData;