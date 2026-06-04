import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(30, "Code must be under 30 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores")
    .transform((v) => v.toUpperCase().trim()),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0.01, "Value must be greater than 0"),
  minPurchase: z.number().min(0, "Minimum purchase must be 0 or more").optional(),
  maxDiscount: z.number().min(0).nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().min(1, "Expiry date is required"),
});

export type CouponInput = z.infer<typeof couponSchema>;
