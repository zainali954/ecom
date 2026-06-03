import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const PROVINCES = [
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "Gilgit Baltistan",
  "Azad Kashmir",
  "Islamabad Capital Territory",
] as const;

const addressSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  alternatePhone: {
    type: String,
    trim: true,
    default: "",
  },
  province: {
    type: String,
    required: true,
    enum: PROVINCES,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  area: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
    default: "",
  },
  postalCode: {
    type: String,
    trim: true,
    default: "",
  },
  landmark: {
    type: String,
    trim: true,
    default: "",
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

addressSchema.plugin(timestampPlugin);

export type IAddress = InferSchemaType<typeof addressSchema> & { _id: mongoose.Types.ObjectId };

export const Address = mongoose.models.Address || mongoose.model("Address", addressSchema);
