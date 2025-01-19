import * as Yup from "yup";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

const identifierYup = Yup.string()
  .required("Username or email are required.")
  .test(
    "is-username-or-email",
    "Must be a valid username or email address",
    (value) => {
      if (!value) return false;

      const isEmail = emailRegex.test(value);
      const isUsername = usernameRegex.test(value);
      return isEmail || isUsername;
    },
  );

//reusable password validation
const passwordYup = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .matches(/[A-Z]/, "Password must include at least one uppercase letter.")
  .matches(/[a-z]/, "Password must include at least one lowercase letter.")
  .matches(/[0-9]/, "Password must include at least one number.")
  .matches(
    /[@$!%*?&#]/,
    "Password must include at least one special character.",
  )
  .required("Password is required.");

export const loginSchema = Yup.object().shape({
  identifier: identifierYup,
  password: passwordYup,
  rememberMe: Yup.boolean().optional(),
});

export const signupSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must not exceed 30 characters.")
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, underscores, periods, and hyphens.",
    )
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email format.")
    .required("Email is required."),
  password: passwordYup,

  repeatPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords do not match.")
    .required("Please repeat your password"),
});
