import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

userSchema.plugin(timestampPlugin);

export type IUser = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User = mongoose.models.User || mongoose.model("User", userSchema);
