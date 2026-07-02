import { z } from "zod";

export const createCategorySchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters"),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .optional(),
  })
  .strict();
