import { z } from "zod";

export const placeOrderSchema = z.object({
  addressId: z.string().min(1, "Please select a shipping address"),
  paymentMethod: z.enum(["cod", "jazzcash", "easypaisa", "bank-transfer"], {
    message: "Please select a payment method",
  }),
  notes: z.string().max(500, "Notes must be under 500 characters").optional().default(""),
});

export type PlaceOrderFormData = z.infer<typeof placeOrderSchema>;
