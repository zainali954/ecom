import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password — DollarShop",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">Invalid reset link. No token provided.</p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-medium">Reset your password</h2>
        <p className="text-sm text-muted-foreground">Enter your new password below</p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
