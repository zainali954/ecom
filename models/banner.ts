import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const bannerSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  subtitle: {
    type: String,
    trim: true,
    default: "",
  },
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    trim: true,
    default: "",
  },
  position: {
    type: String,
    enum: ["hero", "promotional", "sidebar"],
    default: "hero",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  startsAt: {
    type: Date,
    default: null,
  },
  endsAt: {
    type: Date,
    default: null,
  },
});

bannerSchema.plugin(timestampPlugin);

export type IBanner = InferSchemaType<typeof bannerSchema> & { _id: mongoose.Types.ObjectId };

export const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
