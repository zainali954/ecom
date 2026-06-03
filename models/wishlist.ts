import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const wishlistSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

wishlistSchema.plugin(timestampPlugin);

export type IWishlist = InferSchemaType<typeof wishlistSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
