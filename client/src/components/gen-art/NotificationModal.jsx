
import styles from './GenArt.module.css'; 

const NotificationModal = ({ isOpen, onClose, title, message, actionText, onAction }) => {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>{title}</h2>
          <button className={styles['close-button']} onClick={onClose}>×</button>
        </div>
        <div className={styles['modal-body']}>
          <p>{message}</p>
        </div>
        <div className={styles['modal-footer']}>
          <button className={styles['action-button']} onClick={handleAction}>
            {actionText || 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;