import React, { useContext, useState } from "react";
import styles from "./Login.module.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../schemas/validationSchemas";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

import eyeOpenIcon from "../../assets/icons/login/eye-open.svg";
import eyeClosedIcon from "../../assets/icons/login/eye-closed.svg";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register: registerUser } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(signupSchema) });

  const onSubmit = async (data) => {
    try {
      const success = await registerUser(data);
      if (success) {
        console.log("Register successful!");
        navigate("/home");
      } else {
        console.error("Registration failed.");
      }
    } catch (err) {
      console.error("Error during registration process: ", err);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <form
        className={styles["signup-form"]}
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Signup Form"
      >
        <h2>Sign up for free</h2>
        <p className={styles.subtext}>
          Or <a href="/login">sign in to your existing account</a>
        </p>

        <div className={styles["form-group"]}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            {...register("username")}
            aria-required="true"
            className={styles["input-field"]}
          />
          {errors.username && (
            <div role="alert" className={styles.error}>
              {errors.username.message}
            </div>
          )}
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="text"
            {...register("email")}
            aria-required="true"
            className={styles["input-field"]}
          />
          {errors.email && (
            <div role="alert" className={styles.error}>
              {errors.email.message}
            </div>
          )}
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="password">Password:</label>
          <div className={styles["password-input-container"]}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              aria-required="true"
              className={styles["input-field"]}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles["password-toggle"]}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <img src={eyeClosedIcon} alt="Hide password" />
              ) : (
                <img src={eyeOpenIcon} alt="Show password" />
              )}
            </button>
          </div>

          {errors.password && (
            <div role="alert" className={styles.error}>
              {errors.password.message}
            </div>
          )}
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="repeatPassword">Repeat password:</label>
          <div className={styles["password-input-container"]}>
            <input
              id="repeatPassword"
              type={showPassword ? "text" : "password"}
              {...register("repeatPassword")}
              aria-required="true"
              className={styles["input-field"]}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles["password-toggle"]}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <img src={eyeClosedIcon} alt="Hide password" />
              ) : (
                <img src={eyeOpenIcon} alt="Show password" />
              )}
            </button>
          </div>

          {errors.repeatPassword && (
            <div role="alert" className={styles.error}>
              {errors.repeatPassword.message}
            </div>
          )}
        </div>

        <a href="/terms-of-use" className={styles.terms}>
          By signing up, you agree to our terms of use.
        </a>

        <button
          className={`${styles["login-btn"]} ${styles.btn}`}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up..." : "Sign up"}
        </button>

        <div className={styles.separator}>
          <span>Or continue with</span>
        </div>
        <div className={styles["social-login-container"]}>
          <button
            type="button"
            className={styles["social-btn"]}
            onClick={() => (window.location.href = "/auth/google")}
          >
            Google
          </button>
          <button
            type="button"
            className={styles["social-btn"]}
            onClick={() => (window.location.href = "/auth/github")}
          >
            Github
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
