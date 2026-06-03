import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const productAttributeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  affectsPrice: {
    type: Boolean,
    default: false,
  },
  affectsStock: {
    type: Boolean,
    default: false,
  },
  affectsSku: {
    type: Boolean,
    default: false,
  },
});

productAttributeSchema.plugin(timestampPlugin);

export type IProductAttribute = InferSchemaType<typeof productAttributeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductAttribute =
  mongoose.models.ProductAttribute || mongoose.model("ProductAttribute", productAttributeSchema);
