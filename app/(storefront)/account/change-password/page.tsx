import type { Metadata } from "next";
import Link from "next/link";
import { ChangePasswordForm } from "@/features/account/components/change-password-form";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Set a new password for your account",
  robots: { index: false, follow: false },
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Invalid or missing link. Please request a new password change link from your profile
            settings.
          </p>
        </div>
        <Link
          href="/account/profile"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Go to profile settings
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Change Password</h2>
      <p className="mt-1 text-sm text-muted-foreground">Enter your new password below</p>

      <div className="mt-6 max-w-md">
        <ChangePasswordForm token={token} />
      </div>
    </div>
  );
}
