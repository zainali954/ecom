"use server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { Inventory } from "@/models/inventory";
import { revalidatePath } from "next/cache";
import { inventoryUpdateSchema, inventoryBulkUpdateSchema } from "@/schemas/inventory";

export async function updateInventory(inventoryId: string, data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = inventoryUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    return { success: false, message: "Inventory record not found" };
  }

  inventory.stock = parsed.data.stock;
  inventory.lowStockThreshold = parsed.data.lowStockThreshold;
  if (parsed.data.sku !== undefined) {
    inventory.sku = parsed.data.sku;
  }

  await inventory.save();

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${inventoryId}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true, message: "Inventory updated successfully" };
}

export async function bulkUpdateStock(data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = inventoryBulkUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const bulkOps = parsed.data.items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { stock: item.stock } },
    },
  }));

  await Inventory.bulkWrite(bulkOps);

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return {
    success: true,
    message: `${parsed.data.items.length} inventory record${parsed.data.items.length !== 1 ? "s" : ""} updated`,
  };
}

export async function adjustStock(inventoryId: string, adjustment: number) {
  await requireAdmin();
  await connectDB();

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    return { success: false, message: "Inventory record not found" };
  }

  const newStock = inventory.stock + adjustment;
  if (newStock < 0) {
    return { success: false, message: "Stock cannot be negative" };
  }

  inventory.stock = newStock;
  await inventory.save();

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${inventoryId}`);
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return {
    success: true,
    message: `Stock ${adjustment > 0 ? "increased" : "decreased"} to ${newStock}`,
  };
}
