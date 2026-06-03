import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
});

cartSchema.plugin(timestampPlugin);

export type ICart = InferSchemaType<typeof cartSchema> & { _id: mongoose.Types.ObjectId };

export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
