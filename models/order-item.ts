import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const orderItemSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true,
  },
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
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    default: "",
  },
  variantLabel: {
    type: String,
    default: "",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

orderItemSchema.plugin(timestampPlugin);

export type IOrderItem = InferSchemaType<typeof orderItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OrderItem = mongoose.models.OrderItem || mongoose.model("OrderItem", orderItemSchema);
