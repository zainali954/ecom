import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

const PAYMENT_METHODS = ["cod", "jazzcash", "easypaisa", "bank-transfer"] as const;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String, default: "" },
    province: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    landmark: { type: String, default: "" },
  },
  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: "pending",
    index: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  coupon: {
    type: Schema.Types.ObjectId,
    ref: "Coupon",
    default: null,
  },
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS,
    default: "cod",
  },
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUSES,
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
});

orderSchema.plugin(timestampPlugin);

export type IOrder = InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
