"use server";

import { Resend } from "resend";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getVerifyEmailHtml } from "@/emails/verify-email";
import { getResetPasswordHtml } from "@/emails/reset-password";
import { getWelcomeHtml } from "@/emails/welcome";

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = "DollarShop <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const url = `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email — DollarShop",
    html: getVerifyEmailHtml(url),
  });

  if (error) {
    logger.error("Failed to send verification email", { email, error });
    throw new Error("Failed to send verification email");
  }

  logger.info("Verification email sent", { email });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const url = `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password — DollarShop",
    html: getResetPasswordHtml(url),
  });

  if (error) {
    logger.error("Failed to send password reset email", { email, error });
    throw new Error("Failed to send password reset email");
  }

  logger.info("Password reset email sent", { email });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to DollarShop!",
    html: getWelcomeHtml(name),
  });

  if (error) {
    logger.error("Failed to send welcome email", { email, error });
  }

  logger.info("Welcome email sent", { email });
}
