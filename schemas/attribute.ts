import { z } from "zod";

export const attributeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120, "Slug must be under 120 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
    .trim(),
  affectsPrice: z.boolean().optional(),
  affectsStock: z.boolean().optional(),
  affectsSku: z.boolean().optional(),
});

export const attributeValueSchema = z.object({
  value: z
    .string()
    .min(1, "Value is required")
    .max(100, "Value must be under 100 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120, "Slug must be under 120 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
    .trim(),
});

export type AttributeInput = z.infer<typeof attributeSchema>;
export type AttributeValueInput = z.infer<typeof attributeValueSchema>;
