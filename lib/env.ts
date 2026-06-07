import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(1),
  MAILTRAP_HOST: z.string().min(1),
  MAILTRAP_PORT: z.coerce.number().int().positive(),
  MAILTRAP_USERNAME: z.string().min(1),
  MAILTRAP_PASSWORD: z.string().min(1),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    );
  }

  return parsed.data;
}

export const env = validateEnv();
