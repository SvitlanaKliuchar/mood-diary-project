//Ensures the request payload contains valid data (e.g., a valid mood and optional note).
//Without it, the app might crash or behave unexpectedly when processing invalid data.
import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

const passwordValidation = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[@$!%*?&#]/, "Password must include at least one special character");

const usernameValidation = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must not exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    "Username can only contain letters, numbers, underscores, periods, and hyphens",
  );

const emailValidation = z.string().regex(emailRegex, "Invalid email address.");

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Username or email are required." })  
    .min(1, "Username or email are required.")
    .refine(
      (val) => {
        const isEmail = emailRegex.test(val);
        const isUsername = usernameRegex.test(val);
        return isEmail || isUsername;
      },
      {
        message: "Must be a valid username or email address",
      }
    ),
  password: passwordValidation,
  rememberMe: z.boolean().optional(),
});


export const registerSchema = z
  .object({
    username: usernameValidation,
    email: emailValidation,
    password: passwordValidation,
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ["repeatPassword"],
    message: "Passwords do not match.",
  });
