import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: 0,
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: 0,
  },
  maxUses: {
    type: Number,
    default: null,
    min: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

couponSchema.plugin(timestampPlugin);

export type ICoupon = InferSchemaType<typeof couponSchema> & { _id: mongoose.Types.ObjectId };

export const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
