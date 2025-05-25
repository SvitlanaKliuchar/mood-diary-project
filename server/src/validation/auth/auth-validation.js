//Ensures the request payload contains valid data (e.g., a valid mood and optional note).
//Without it, the app might crash or behave unexpectedly when processing invalid data.
import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

const strongEmailValidation = z
  .string()
  .min(1, "Email is required")
  .max(254, "Email is too long") // RFC 5321 limit
  .regex(emailRegex, "Invalid email format")
  .refine((email) => {
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domainPart] = parts;
    
    if (localPart.length > 64) return false; // RFC 5321 limit
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false; // No consecutive dots
    
    if (domainPart.length > 253) return false; // RFC 5321 limit
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
    if (domainPart.startsWith('-') || domainPart.endsWith('-')) return false;
    if (domainPart.includes('..')) return false; // No consecutive dots
    
    const domainParts = domainPart.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    
    return true;
  }, {
    message: "Invalid email address format"
  });

const passwordValidation = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(128, "Password is too long") 
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
  )
  .refine((username) => {
    if (username.startsWith('.') || username.endsWith('.')) return false;
    if (username.startsWith('-') || username.endsWith('-')) return false;
    if (username.includes('..')) return false; // No consecutive dots
    if (username.includes('--')) return false; // No consecutive hyphens
    return true;
  }, {
    message: "Username format is invalid"
  });

const emailValidation = strongEmailValidation;

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Username or email are required." })  
    .min(1, "Username or email are required.")
    .refine(
      (val) => {
        const trimmedVal = val.trim();
        
        const isEmail = emailRegex.test(trimmedVal) && 
                        trimmedVal.includes('@') && 
                        trimmedVal.length <= 254;
        
        const isUsername = usernameRegex.test(trimmedVal) && 
                          trimmedVal.length >= 3 && 
                          trimmedVal.length <= 30;
        
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