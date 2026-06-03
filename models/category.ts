import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const categorySchema = new Schema({
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
  description: {
    type: String,
    trim: true,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
});

categorySchema.plugin(timestampPlugin);

export type ICategory = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
