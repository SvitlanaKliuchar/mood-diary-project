import { useState } from 'react';
import styles from '../SettingsList.module.css';

const ExportData = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsExporting(true);

    // await exportData(password); TODO

    //simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      onClose(); //close modal after export is done
    }, 1000);
  };

  return (
    <div className={styles['settings-list']}>
            <button onClick={onClose} className={styles['back-btn']} aria-label="Back">
                ←
            </button>
      <div className={styles['export-data-container']}>
        <p id="export-data-title" className={styles['main-text']}>
          Download a copy of your data for backup or to transfer to another service
        </p>

        <form onSubmit={handleSubmit} className={styles['modal-form']}>
          <label htmlFor="password" className={styles['input-label']}>
            Enter password:
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className={styles['export-data-btn']}
            aria-label="Export Data Button"
            type="submit"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </form>

        <p className={styles.tip}>The import feature is coming soon!</p>
      </div>
    </div>
  );
};

export default ExportData;
