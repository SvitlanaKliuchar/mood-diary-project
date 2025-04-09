import { useContext, useState } from 'react';
import styles from '../SettingsList.module.css';
import axiosInstance from '../../../utils/axiosInstance.js'
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/profile/${user.id}`, { data: { password } })
      console.log(response)

      setIsDeleting(false);
      onClose();  
      navigate('/')
    } catch (err) {
      console.error("Failed to delele account: ", err);
      setIsDeleting(false);
    }

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
