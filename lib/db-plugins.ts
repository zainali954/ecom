import type { Schema } from "mongoose";

export function timestampPlugin(schema: Schema): void {
  schema.set("timestamps", true);
  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
}
