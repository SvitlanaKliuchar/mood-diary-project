import { useState } from 'react';
import styles from '../SettingsList.module.css'

const DeleteAccount = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsDeleting(true)
        //api call
    }

    // if (!isOpen) return null

    return (
        <div className={styles['delete-account-container']} >
            <p className={styles['main-text']}>Are you sure you want to delete your account?</p>
            <p className={styles['text-two']}>This action is irreversible. All your data will be lost.</p>
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
                className={styles['delete-account-btn']}
                aria-label='Delete Account Button'
                type='submit'
                disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            <p className={styles.tip}>Tip: You can export your data before account deletion!</p>
            <button className={styles['close-btn']} aria-label='Close Modal Button'>&times;</button>
        </div>
    );
};

export default DeleteAccount;