import { useContext, useState } from "react";
import styles from "../SettingsList.module.css";
import axiosInstance from "../../../utils/axiosInstance.js";
import { AuthContext } from "../../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../loading/LoadingSpinner.jsx";

const DeleteAccount = ({ onClose }) => {
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    
    setIsDeleting(true);
    setError(""); 
    
    try {
      const response = await axiosInstance.delete(`/profile/${user.id}`, {
        headers: {
          'X-Delete-Password': password,
        }
      });
      
      console.log(response);
      
      if (logout) {
        await logout();
      }
      
      setIsDeleting(false);
      onClose();
      navigate("/", { replace: true });
      
    } catch (err) {
      console.error("Failed to delete account:", err);
      setIsDeleting(false);
      
      if (err.response?.status === 401) {
        setError("Incorrect password");
      } else if (err.response?.status === 403) {
        setError("Account deletion not allowed");
      } else if (err.response?.status === 404) {
        setError("Account not found");
      } else {
        setError(err.response?.data?.message || "Failed to delete account");
      }
    }
  };

  return (
    <div className={styles["settings-list"]}>
      <button
        onClick={onClose}
        className={styles["back-btn"]}
        aria-label="Back"
      >
        ←
      </button>
      <div className={styles["delete-account-container"]}>
        <p id="delete-account-title" className={styles["main-text"]}>
          Are you sure you want to delete your account?
        </p>
        <p className={styles["text-two"]}>
          This action is irreversible. All your data will be lost.
        </p>
        
        <form onSubmit={handleSubmit} className={styles["modal-form"]}>
          <label htmlFor="password" className={styles["input-label"]}>
            Enter password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(""); 
            }}
            required
            disabled={isDeleting} 
          />
          
          {error && (
            <p className={styles["text-two"]} style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              ⚠️ {error}
            </p>
          )}
          
          <button
            className={styles["delete-account-btn"]}
            aria-label="Delete Account Button"
            type="submit"
            disabled={isDeleting}
          >
            {isDeleting ? <LoadingSpinner /> : "Delete Account"}{" "}
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