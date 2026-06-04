import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const variantAttributeSchema = new Schema(
  {
    attribute: {
      type: Schema.Types.ObjectId,
      ref: "ProductAttribute",
      required: true,
    },
    value: {
      type: Schema.Types.ObjectId,
      ref: "ProductAttributeValue",
      required: true,
    },
  },
  { _id: false },
);

const productVariantSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  attributes: {
    type: [variantAttributeSchema],
    required: true,
  },
  price: {
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
  // Stock is tracked in the Inventory collection, not here
  isActive: {
    type: Boolean,
    default: true,
  },
});

productVariantSchema.plugin(timestampPlugin);

export type IProductVariant = InferSchemaType<typeof productVariantSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductVariant =
  mongoose.models.ProductVariant || mongoose.model("ProductVariant", productVariantSchema);
