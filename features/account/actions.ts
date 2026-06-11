"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import { generateToken, hashPassword } from "@/lib/auth-utils";
import { User } from "@/models/user";
import { VerificationToken } from "@/models/verification-token";
import { updateProfileSchema, changePasswordSchema } from "@/schemas/auth";
import { sendChangePasswordEmail } from "@/services/email";
import type { AuthActionState } from "@/types/auth";

const CHANGE_PASSWORD_TOKEN_EXPIRY_HOURS = 1;

export async function updateProfile(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in" };
  }

  const raw = { name: formData.get("name") as string };
  const parsed = updateProfileSchema.safeParse(raw);

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

    await User.updateOne({ _id: session.user.id }, { name: parsed.data.name });

    logger.info("Profile updated", { userId: session.user.id });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    logger.error("Profile update failed", {
      error: error instanceof Error ? error.message : error,
    });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function requestPasswordChange(_prevState: AuthActionState): Promise<AuthActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { success: false, message: "You must be logged in" };
  }

  try {
    await connectDB();

    const user = await User.findOne({ _id: session.user.id, isActive: true }).lean();
    if (!user) {
      return { success: false, message: "Account not found" };
    }

    await VerificationToken.deleteMany({ email: user.email, type: "password-reset" });

    const token = generateToken();
    await VerificationToken.create({
      token,
      email: user.email,
      type: "password-reset",
      expiresAt: new Date(Date.now() + CHANGE_PASSWORD_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    });

    await sendChangePasswordEmail(user.email, token);
    logger.info("Password change email sent", { email: user.email });

    return {
      success: true,
      message: "We've sent a password change link to your email. Please check your inbox.",
    };
  } catch (error) {
    logger.error("Request password change failed", {
      error: error instanceof Error ? error.message : error,
    });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function changePassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = changePasswordSchema.safeParse(raw);

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
      return { success: false, message: "Invalid or expired link. Please request a new one." };
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    await User.updateOne({ email: verificationToken.email }, { password: hashedPassword });

    await VerificationToken.deleteMany({
      email: verificationToken.email,
      type: "password-reset",
    });

    logger.info("Password changed via account settings", { email: verificationToken.email });

    return { success: true, message: "Password changed successfully." };
  } catch (error) {
    logger.error("Change password failed", {
      error: error instanceof Error ? error.message : error,
    });
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
