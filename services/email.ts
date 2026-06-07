"use server";

import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getVerifyEmailHtml } from "@/emails/verify-email";
import { getResetPasswordHtml } from "@/emails/reset-password";
import { getWelcomeHtml } from "@/emails/welcome";
import { getOrderConfirmationHtml } from "@/emails/order-confirmation";
import { getOrderStatusUpdatedHtml } from "@/emails/order-status-updated";

const transporter = nodemailer.createTransport({
  host: env.MAILTRAP_HOST,
  port: env.MAILTRAP_PORT,
  auth: {
    user: env.MAILTRAP_USERNAME,
    pass: env.MAILTRAP_PASSWORD,
  },
});

const FROM_EMAIL = "DollarShop <noreply@dollarshop.pk>";

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const url = `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your email — DollarShop",
      html: getVerifyEmailHtml(url),
    });
    logger.info("Verification email sent", { email });
  } catch (error) {
    logger.error("Failed to send verification email", { email, error });
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const url = `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your password — DollarShop",
      html: getResetPasswordHtml(url),
    });
    logger.info("Password reset email sent", { email });
  } catch (error) {
    logger.error("Failed to send password reset email", { email, error });
    throw new Error("Failed to send password reset email");
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to DollarShop!",
      html: getWelcomeHtml(name),
    });
    logger.info("Welcome email sent", { email });
  } catch (error) {
    logger.error("Failed to send welcome email", { email, error });
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  data: {
    customerName: string;
    orderNumber: string;
    items: {
      name: string;
      variantLabel: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    paymentMethod: string;
    shippingAddress: string;
  },
): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Order Confirmed — ${data.orderNumber} — DollarShop`,
      html: getOrderConfirmationHtml(data),
    });
    logger.info("Order confirmation email sent", { email, orderNumber: data.orderNumber });
  } catch (error) {
    logger.error("Failed to send order confirmation email", { email, error });
  }
}

export async function sendOrderStatusEmail(
  email: string,
  data: {
    customerName: string;
    orderNumber: string;
    oldStatus: string;
    newStatus: string;
  },
): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Order ${data.orderNumber} — Status Updated — DollarShop`,
      html: getOrderStatusUpdatedHtml(data),
    });
    logger.info("Order status email sent", { email, orderNumber: data.orderNumber });
  } catch (error) {
    logger.error("Failed to send order status email", { email, error });
  }
}
