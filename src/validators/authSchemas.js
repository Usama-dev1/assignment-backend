import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();
