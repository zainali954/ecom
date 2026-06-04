import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  alt: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const productAttributeSchema = z.object({
  attribute: z.string().min(1, "Attribute is required"),
  values: z.array(z.string()).min(1, "At least one value is required"),
});

const productVariantSchema = z.object({
  id: z.string().optional(),
  attributes: z.array(
    z.object({
      attribute: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
  price: z.number().min(0, "Price must be 0 or more"),
  salePrice: z.number().min(0).nullable().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be under 200 characters")
    .trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(220, "Slug must be under 220 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")
    .trim(),
  description: z.string().trim().optional(),
  shortDescription: z
    .string()
    .max(500, "Short description must be under 500 characters")
    .trim()
    .optional(),
  images: z.array(productImageSchema).optional(),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["simple", "variable"]),
  basePrice: z.number().min(0, "Base price must be 0 or more"),
  salePrice: z.number().min(0).nullable().optional(),
  sku: z.string().trim().optional(),
  attributes: z.array(productAttributeSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
