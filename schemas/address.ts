import { z } from "zod";

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "Gilgit Baltistan",
  "Azad Kashmir",
  "Islamabad Capital Territory",
] as const;

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15)
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number"),
  alternatePhone: z
    .string()
    .max(15)
    .regex(/^[0-9+\-\s]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  province: z.enum(PROVINCES, { message: "Please select a province" }),
  city: z.string().min(2, "City is required").max(100),
  area: z.string().min(2, "Area is required").max(200),
  addressLine1: z.string().min(5, "Address is required").max(300),
  addressLine2: z.string().max(300).optional().or(z.literal("")),
  postalCode: z.string().max(10).optional().or(z.literal("")),
  landmark: z.string().max(200).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
