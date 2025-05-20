import { useState } from "react";
import styles from "../Login.module.css";
import axiosInstance from "../../../utils/axiosInstance.js";

const EmailForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //send the email to your server
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      if (response.status === 200) {
        setMessage("Password reset link sent. Check your email!");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to send reset link. Please try again.",
      );
      console.error("Error sending reset link:", error);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>Forgot your password?</h1>
      <form onSubmit={handleSubmit} className={styles["email-form"]}>
        <div className={styles["reset-form-group"]}>
          <label htmlFor="email">What's your email address?</label>
          <input
            className={styles["input-field"]}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            name="email"
            id="email"
            value={email}
            placeholder="you@example.com"
            required
          />
        </div>
        <button
          type="submit"
          disabled={!email.trim()}
          className={`${styles["reset-btn"]} ${styles["login-btn"]}`}
        >
          Send reset link
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default EmailForm;
