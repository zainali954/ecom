"use server";

import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import { hashPassword } from "@/lib/auth-utils";
import { generateToken } from "@/lib/auth-utils";
import { User } from "@/models/user";
import { VerificationToken } from "@/models/verification-token";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth";
import { signIn, signOut } from "@/auth";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@/services/email";
import type { AuthActionState } from "@/types/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

const VERIFY_TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function register(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key) {
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
    }
    return { success: false, message: "Validation failed", errors: fieldErrors };
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email: parsed.data.email }).lean();
    if (existing) {
      return { success: false, message: "An account with this email already exists" };
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    });

    const token = generateToken();
    await VerificationToken.create({
      token,
      email: parsed.data.email,
      type: "email-verify",
      expiresAt: new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    });

    await sendVerificationEmail(parsed.data.email, token);
    await sendWelcomeEmail(parsed.data.email, parsed.data.name);

    logger.info("User registered", { email: parsed.data.email });

    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
    };
  } catch (error) {
    logger.error("Registration failed", { error: error instanceof Error ? error.message : error });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key) {
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
    }
    return { success: false, message: "Validation failed", errors: fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    logger.info("User logged in", { email: parsed.data.email });
    return { success: true, message: "Logged in successfully" };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.cause?.err?.message === "EMAIL_NOT_VERIFIED") {
        return {
          success: false,
          message:
            "Please verify your email before signing in. Check your inbox for the verification link.",
          errors: { emailNotVerified: ["true"] },
        };
      }
      return { success: false, message: "Invalid email or password" };
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function resendVerificationEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, message: "Please enter your email address" };
  }

  try {
    await connectDB();

    const user = await User.findOne({ email, isActive: true }).lean();

    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists, we've sent a new verification link.",
      };
    }

    if (user.emailVerified) {
      return { success: false, message: "This email is already verified. You can sign in." };
    }

    await VerificationToken.deleteMany({ email, type: "email-verify" });

    const token = generateToken();
    await VerificationToken.create({
      token,
      email,
      type: "email-verify",
      expiresAt: new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    });

    await sendVerificationEmail(email, token);
    logger.info("Verification email resent", { email });

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    logger.error("Resend verification failed", {
      error: error instanceof Error ? error.message : error,
    });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function forgotPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = { email: formData.get("email") as string };

  const parsed = forgotPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: "Please enter a valid email address" };
  }

  try {
    await connectDB();

    const user = await User.findOne({ email: parsed.data.email, isActive: true }).lean();

    if (user) {
      await VerificationToken.deleteMany({ email: parsed.data.email, type: "password-reset" });

      const token = generateToken();
      await VerificationToken.create({
        token,
        email: parsed.data.email,
        type: "password-reset",
        expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      });

      await sendPasswordResetEmail(parsed.data.email, token);
      logger.info("Password reset email sent", { email: parsed.data.email });
    }

    return {
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    logger.error("Forgot password failed", {
      error: error instanceof Error ? error.message : error,
    });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key) {
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
    }
    return { success: false, message: "Validation failed", errors: fieldErrors };
  }

  try {
    await connectDB();

    const verificationToken = await VerificationToken.findOne({
      token: parsed.data.token,
      type: "password-reset",
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!verificationToken) {
      return { success: false, message: "Invalid or expired reset link" };
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    await User.updateOne({ email: verificationToken.email }, { password: hashedPassword });

    await VerificationToken.deleteMany({
      email: verificationToken.email,
      type: "password-reset",
    });

    logger.info("Password reset successful", { email: verificationToken.email });

    return { success: true, message: "Password reset successful. You can now log in." };
  } catch (error) {
    logger.error("Password reset failed", {
      error: error instanceof Error ? error.message : error,
    });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function verifyEmail(token: string): Promise<AuthActionState> {
  try {
    await connectDB();

    const verificationToken = await VerificationToken.findOne({
      token,
      type: "email-verify",
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!verificationToken) {
      return { success: false, message: "Invalid or expired verification link" };
    }

    await User.updateOne({ email: verificationToken.email }, { emailVerified: new Date() });

    await VerificationToken.deleteMany({
      email: verificationToken.email,
      type: "email-verify",
    });

    logger.info("Email verified", { email: verificationToken.email });

    return { success: true, message: "Email verified successfully! You can now log in." };
  } catch (error) {
    logger.error("Email verification failed", {
      error: error instanceof Error ? error.message : error,
    });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
