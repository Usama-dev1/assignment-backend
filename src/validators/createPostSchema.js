import { z } from "zod";

export const createPostSchema = z
  .object({
    title: z.string().trim().min(10, "Title must be at least 10 characters"),
    content: z
      .string()
      .trim()
      .min(100, "Content must be at least 100 characters"),
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID format"),
    draft: z.boolean().optional(),
  })
  .strict();
