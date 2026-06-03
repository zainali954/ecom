import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const productImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "",
  },
  images: {
    type: [productImageSchema],
    default: [],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["simple", "variable"],
    default: "simple",
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
    default: null,
  },
  sku: {
    type: String,
    trim: true,
    default: "",
  },
  attributes: [
    {
      attribute: {
        type: Schema.Types.ObjectId,
        ref: "ProductAttribute",
        required: true,
      },
      values: [
        {
          type: Schema.Types.ObjectId,
          ref: "ProductAttributeValue",
        },
      ],
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isBestSeller: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: [String],
    default: [],
  },
});

productSchema.plugin(timestampPlugin);

export type IProduct = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
