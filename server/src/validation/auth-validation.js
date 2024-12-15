//Ensures the request payload contains valid data (e.g., a valid mood and optional note). 
//Without it, the app might crash or behave unexpectedly when processing invalid data.
import { z } from zod

const passwordValidation = z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[@$!%*?&#]/, "Password must include at least one special character")

const usernamevalidation = z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, underscores, periods, and hyphens");

export const registerSchema = z.object({
    username: usernamevalidation,
    password: passwordValidation
})

export const loginSchema = z.object({
    username: usernamevalidation,
    password: z.string().min(6, "Password must be at least 6 characters long")
})