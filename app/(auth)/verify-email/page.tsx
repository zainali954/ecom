import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmail } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">Invalid verification link. No token provided.</p>
        <Link href="/login" className="text-sm font-medium text-foreground hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  const result = await verifyEmail(token);

  return (
    <div className="space-y-4 text-center">
      <div
        className={`rounded-lg border p-4 ${
          result.success ? "border-border bg-muted/50" : "border-destructive/20 bg-destructive/5"
        }`}
      >
        <p className={`text-sm ${result.success ? "text-foreground" : "text-destructive"}`}>
          {result.message}
        </p>
      </div>
      <Link href="/login" className="text-sm font-medium text-foreground hover:underline">
        Go to login
      </Link>
    </div>
  );
}
