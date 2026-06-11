import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your account settings and view your orders",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account settings and view your orders
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/account/profile"
          className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
        >
          <h3 className="text-sm font-medium">Profile</h3>
          <p className="mt-1 text-xs text-muted-foreground">Update your name and change password</p>
        </Link>
        <Link
          href="/account/orders"
          className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
        >
          <h3 className="text-sm font-medium">Orders</h3>
          <p className="mt-1 text-xs text-muted-foreground">View and track your orders</p>
        </Link>
        <Link
          href="/account/addresses"
          className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
        >
          <h3 className="text-sm font-medium">Addresses</h3>
          <p className="mt-1 text-xs text-muted-foreground">Manage your delivery addresses</p>
        </Link>
      </div>
    </div>
  );
}
