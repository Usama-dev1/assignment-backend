import { z } from "zod";

export const createPostSchema = z
  .object({
    title: z.string().trim().min(10, "Title must be at least 10 characters"),
    content: z
      .string()
      .trim()
      .min(10, "Content must be at least 10 characters"),
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID format"),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  })
  .strict();
