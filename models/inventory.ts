import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const inventorySchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    default: null,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0,
  },
  sku: {
    type: String,
    trim: true,
    default: "",
  },
});

inventorySchema.index({ product: 1, variant: 1 }, { unique: true });
inventorySchema.plugin(timestampPlugin);

export type IInventory = InferSchemaType<typeof inventorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
