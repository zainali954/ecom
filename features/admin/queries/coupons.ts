import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/coupon";
import type { AdminCoupon, AdminCouponsPageData } from "@/types/admin";

const COUPONS_PER_PAGE = 15;

export async function getAdminCoupons(
  page = 1,
  search?: string,
  status?: string,
): Promise<AdminCouponsPageData> {
  await connectDB();

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.code = { $regex: search, $options: "i" };
  }

  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  } else if (status === "expired") {
    filter.expiresAt = { $lt: new Date() };
  }

  const [docs, total] = await Promise.all([
    Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * COUPONS_PER_PAGE)
      .limit(COUPONS_PER_PAGE)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  const coupons: AdminCoupon[] = docs.map((doc) => {
    const d = doc as Record<string, unknown>;
    return {
      id: String(d._id),
      code: d.code as string,
      type: d.type as "percentage" | "fixed",
      value: (d.value as number) ?? 0,
      minPurchase: (d.minPurchase as number) ?? 0,
      maxDiscount: (d.maxDiscount as number) ?? null,
      maxUses: (d.maxUses as number) ?? null,
      usedCount: (d.usedCount as number) ?? 0,
      isActive: (d.isActive as boolean) ?? true,
      expiresAt: d.expiresAt
        ? new Date(d.expiresAt as string).toISOString()
        : new Date().toISOString(),
      createdAt: d.createdAt
        ? new Date(d.createdAt as string).toISOString()
        : new Date().toISOString(),
      updatedAt: d.updatedAt
        ? new Date(d.updatedAt as string).toISOString()
        : new Date().toISOString(),
    };
  });

  return {
    coupons,
    total,
    page,
    totalPages: Math.ceil(total / COUPONS_PER_PAGE),
  };
}

export async function getAdminCouponById(couponId: string): Promise<AdminCoupon | null> {
  await connectDB();

  const doc = await Coupon.findById(couponId).lean();
  if (!doc) return null;

  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    code: d.code as string,
    type: d.type as "percentage" | "fixed",
    value: (d.value as number) ?? 0,
    minPurchase: (d.minPurchase as number) ?? 0,
    maxDiscount: (d.maxDiscount as number) ?? null,
    maxUses: (d.maxUses as number) ?? null,
    usedCount: (d.usedCount as number) ?? 0,
    isActive: (d.isActive as boolean) ?? true,
    expiresAt: d.expiresAt
      ? new Date(d.expiresAt as string).toISOString()
      : new Date().toISOString(),
    createdAt: d.createdAt
      ? new Date(d.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: d.updatedAt
      ? new Date(d.updatedAt as string).toISOString()
      : new Date().toISOString(),
  };
}
