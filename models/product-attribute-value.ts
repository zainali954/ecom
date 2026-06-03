import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const productAttributeValueSchema = new Schema({
  attribute: {
    type: Schema.Types.ObjectId,
    ref: "ProductAttribute",
    required: true,
    index: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
});

productAttributeValueSchema.index({ attribute: 1, slug: 1 }, { unique: true });
productAttributeValueSchema.plugin(timestampPlugin);

export type IProductAttributeValue = InferSchemaType<typeof productAttributeValueSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductAttributeValue =
  mongoose.models.ProductAttributeValue ||
  mongoose.model("ProductAttributeValue", productAttributeValueSchema);
