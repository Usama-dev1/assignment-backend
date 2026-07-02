import { z } from "zod";

export const updatePostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(10, "Title must be at least 10 characters")
      .optional(),

    content: z
      .string()
      .trim()
      .min(100, "Content must be at least 100 characters")
      .optional(),

    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID format")
      .optional(),
    draft: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.categoryId !== undefined ||
      data.draft !== undefined,
    {
      message: "Update post requires title, content, categoryId, or draft",
    },
  );
