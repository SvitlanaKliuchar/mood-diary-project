import { useState } from 'react';
import styles from '../SettingsList.module.css';

const DeleteAccount = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDeleting(true);

    // call api

    //simulate deletion delay
    setTimeout(() => {
      setIsDeleting(false);
      onClose(); //close modal after action completes
    }, 1000);
  };

  return (
   <div className={styles['settings-list']}>
           <button onClick={onClose} className={styles['back-btn']} aria-label="Back">
               ←
           </button>
      <div className={styles['delete-account-container']}>
        <p id="delete-account-title" className={styles['main-text']}>
          Are you sure you want to delete your account?
        </p>
        <p className={styles['text-two']}>
          This action is irreversible. All your data will be lost.
        </p>

        <form onSubmit={handleSubmit} className={styles['modal-form']}>
          <label htmlFor="password" className={styles['input-label']}>
            Enter password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className={styles['delete-account-btn']}
            aria-label="Delete Account Button"
            type="submit"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </form>

        <p className={styles.tip}>
          Tip: You can export your data before account deletion!
        </p>
      </div>
    </div>
  );
};

export default DeleteAccount;
