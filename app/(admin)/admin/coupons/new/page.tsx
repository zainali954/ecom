import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { CouponForm } from "@/features/admin/components/coupons/coupon-form";
import { Button } from "@/components/ui/button";

export default async function AdminNewCouponPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/coupons">← Back to Coupons</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Coupon</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a new discount coupon</p>
      </div>

      <CouponForm />
    </div>
  );
}
