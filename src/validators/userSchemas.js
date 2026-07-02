import { z } from "zod";

export const createUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["user", "admin"]).optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    username: z.string().trim().min(3).optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    role: z.enum(["user", "admin"]).optional(),
  })
  .strict();

export const updateUserRoleSchema = z
  .object({
    role: z.enum(["user", "admin"]),
  })
  .strict();
