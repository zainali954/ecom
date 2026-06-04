import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getAdminCouponById } from "@/features/admin/queries/coupons";
import { CouponForm } from "@/features/admin/components/coupons/coupon-form";
import { Button } from "@/components/ui/button";

export default async function AdminEditCouponPage({
  params,
}: {
  params: Promise<{ couponId: string }>;
}) {
  await requireAdmin();
  const { couponId } = await params;

  const coupon = await getAdminCouponById(couponId);

  if (!coupon) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/coupons">← Back to Coupons</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Coupon</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update coupon {coupon.code}</p>
      </div>

      <CouponForm coupon={coupon} />
    </div>
  );
}
