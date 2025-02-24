import { useEffect, useState } from "react";
import styles from "../Login.module.css";
import axiosInstance from "../../../utils/axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import openEyeIcon from '../../../assets/icons/login/eye-open.svg'
import closedEyeIcon from '../../../assets/icons/login/eye-closed.svg'

const NewPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const { token } = useParams();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axiosInstance.get(
          `/auth/reset-password/${token}`,
        );
        if (response.status === 200) {
          console.log("Token is valid. Proceed updating the password.");
        } else {
          console.error("Token is invalid or has expired");
          navigate("/login");
        }
      } catch (error) {
        setMessage("Error validating token");
        navigate("/login");
      }
    };

    if (token) {
      validateToken();
    } else {
      setMessage("No reset token found");
      navigate("/login");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (newPassword !== repeatNewPassword) {
        setMessage("The passwords should match.");
      }

      const response = await axiosInstance.post(
        `/auth/reset-password/${token}`,
        { newPassword },
      );

      if (response.status === 200) [navigate("/login")];
    } catch (error) {
      setMessage("Error while submitting the new password.");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>Change password</h1>
      <form className={styles["new-password-form"]} onSubmit={handleSubmit}>
        <div className={styles["reset-form-group"]}>
          <label htmlFor="new-password">New password</label>
          <div className={styles["password-input-container"]}>
            <input
              className={styles["input-field"]}
              type={showPassword ? "text" : "password"}
              name="new-password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles["password-toggle"]}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <img
                  src={closedEyeIcon}
                  alt="Hide password"
                />
              ) : (
                <img
                  src={openEyeIcon}
                  alt="Show password"
                />
              )}
            </button>
          </div>
          <label htmlFor="repeat-new-password">Confirm new password</label>
          <div className={styles["password-input-container"]}>
            <input
              className={styles["input-field"]}
              type={showPassword ? "text" : "password"}
              name="repeat-new-password"
              id="repeat-new-password"
              value={repeatNewPassword}
              onChange={(e) => setRepeatNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles["password-toggle"]}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <img
                  src={closedEyeIcon}
                  alt="Hide password"
                />
              ) : (
                <img
                  src={openEyeIcon}
                  alt="Show password"
                />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!newPassword.trim() || !repeatNewPassword.trim()}
          className={`${styles["reset-btn"]} ${styles['login-btn']}`}
        >
          Change my password
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default NewPasswordForm;
