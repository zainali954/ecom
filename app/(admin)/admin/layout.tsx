import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/features/admin/components/admin-shell";

export const metadata: Metadata = {
  title: "Admin | ShopRehan",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return <AdminShell userName={session.user.name ?? "Admin"}>{children}</AdminShell>;
}
