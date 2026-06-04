"use server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { Coupon } from "@/models/coupon";
import { revalidatePath } from "next/cache";
import { couponSchema } from "@/schemas/coupon";

export async function createCoupon(data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = couponSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const existing = await Coupon.findOne({ code: parsed.data.code }).lean();
  if (existing) {
    return { success: false, message: "A coupon with this code already exists" };
  }

  await Coupon.create({
    code: parsed.data.code,
    type: parsed.data.type,
    value: parsed.data.value,
    minPurchase: parsed.data.minPurchase ?? 0,
    maxDiscount: parsed.data.maxDiscount ?? null,
    maxUses: parsed.data.maxUses ?? null,
    isActive: parsed.data.isActive ?? true,
    expiresAt: new Date(parsed.data.expiresAt),
  });

  revalidatePath("/admin/coupons");

  return { success: true, message: "Coupon created successfully" };
}

export async function updateCoupon(couponId: string, data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = couponSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return { success: false, message: "Coupon not found" };
  }

  const duplicate = await Coupon.findOne({
    code: parsed.data.code,
    _id: { $ne: couponId },
  }).lean();
  if (duplicate) {
    return { success: false, message: "A coupon with this code already exists" };
  }

  coupon.code = parsed.data.code;
  coupon.type = parsed.data.type;
  coupon.value = parsed.data.value;
  coupon.minPurchase = parsed.data.minPurchase ?? 0;
  coupon.maxDiscount = parsed.data.maxDiscount ?? null;
  coupon.maxUses = parsed.data.maxUses ?? null;
  coupon.isActive = parsed.data.isActive ?? coupon.isActive;
  coupon.expiresAt = new Date(parsed.data.expiresAt);

  await coupon.save();

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${couponId}`);

  return { success: true, message: "Coupon updated successfully" };
}

export async function deleteCoupon(couponId: string) {
  await requireAdmin();
  await connectDB();

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return { success: false, message: "Coupon not found" };
  }

  await Coupon.findByIdAndDelete(couponId);

  revalidatePath("/admin/coupons");

  return { success: true, message: "Coupon deleted successfully" };
}

export async function toggleCouponStatus(couponId: string) {
  await requireAdmin();
  await connectDB();

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return { success: false, message: "Coupon not found" };
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${couponId}`);

  return {
    success: true,
    message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
  };
}
