import React, { useState } from "react";
import styles from "./Login.module.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../schemas/validationSchemas";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data) => {
    //data contains { identifier (username or email), password }
    console.log(data);
    // Replace with actual login API call
    // const response = await loginApi({ email, password });
    // handle response (e.g., storing tokens, redirecting)
  };
  return (
    <div className={styles["form-container"]}>
      <form
        className={styles["login-form"]}
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Login Form"
      >
        <h2>Sign in to your account</h2>
        <p className={styles.subtext}>
          Or <a href="/signup">sign up for a new account</a>
        </p>

        <div className={styles["form-group"]}>
          <label htmlFor="identifier">Username or email:</label>
          <input
            id="identifier"
            type="text"
            {...register("identifier")}
            aria-required="true"
            className={styles["input-field"]}
          />
          {errors.identifier && (
            <div role="alert" className={styles.error}>
              {errors.identifier.message}
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
                <img
                  src="src/assets/icons/login/eye-closed.svg"
                  alt="Hide password"
                />
              ) : (
                <img
                  src="src/assets/icons/login/eye-open.svg"
                  alt="Show password"
                />
              )}
            </button>
          </div>

          {errors.password && (
            <div role="alert" className={styles.error}>
              {errors.password.message}
            </div>
          )}
        </div>

        <div className={styles["extra-options"]}>
          <label className={styles["checkbox-label"]}>
            <input type="checkbox" {...register("rememberMe")} />
            Remember me
          </label>
          <a href="/forgot-password" className={styles["forgot-password"]}>
            Forgot your password?
          </a>
        </div>

        <button
          className={`${styles["login-btn"]} ${styles.btn}`}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <div className={styles.separator}>
          <span>Or continue with</span>
        </div>
        <div className={styles["social-login-container"]}>
          <button type="button" className={styles["social-btn"]}>
            Provider 1
          </button>
          <button type="button" className={styles["social-btn"]}>
            Provider 2
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
