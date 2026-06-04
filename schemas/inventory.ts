import { z } from "zod";

export const inventoryUpdateSchema = z.object({
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  lowStockThreshold: z.number().int().min(0, "Threshold must be 0 or more"),
  sku: z.string().trim().optional(),
});

export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;

export const inventoryBulkUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, "Inventory ID is required"),
        stock: z.number().int().min(0, "Stock must be 0 or more"),
      }),
    )
    .min(1, "At least one item is required"),
});

export type InventoryBulkUpdateInput = z.infer<typeof inventoryBulkUpdateSchema>;
