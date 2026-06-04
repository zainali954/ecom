import { requireAdmin } from "@/lib/admin-guard";
import { getAdminCoupons } from "@/features/admin/queries/coupons";
import { CouponTable } from "@/features/admin/components/coupons/coupon-table";
import { CouponFilters } from "@/features/admin/components/coupons/coupon-filters";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const data = await getAdminCoupons(page, params.search, params.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create and manage discount coupons</p>
      </div>

      <CouponFilters />
      <CouponTable data={data} />
    </div>
  );
}
