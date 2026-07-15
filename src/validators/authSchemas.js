import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string({
        required_error: "Username is required",
      })
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),

    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(254, "Email is too long"),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&^#()_\-+=\[\]{}|\\:;"'<>,./~`]/,
        "Password must contain at least one special character",
      ),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();
