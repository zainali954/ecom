import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { timestampPlugin } from "@/lib/db-plugins";

const verificationTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["email-verify", "password-reset"],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

verificationTokenSchema.plugin(timestampPlugin);

export type IVerificationToken = InferSchemaType<typeof verificationTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const VerificationToken =
  mongoose.models.VerificationToken || mongoose.model("VerificationToken", verificationTokenSchema);
