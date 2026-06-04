"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { couponSchema, type CouponInput } from "@/schemas/coupon";
import { createCoupon, updateCoupon } from "../../actions/coupons";
import type { AdminCoupon } from "@/types/admin";

interface CouponFormProps {
  coupon?: AdminCoupon;
}

function toDateInputValue(iso: string) {
  return new Date(iso).toISOString().split("T")[0];
}

export function CouponForm({ coupon }: CouponFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!coupon;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      type: coupon?.type ?? "percentage",
      value: coupon?.value ?? 0,
      minPurchase: coupon?.minPurchase ?? 0,
      maxDiscount: coupon?.maxDiscount ?? null,
      maxUses: coupon?.maxUses ?? null,
      isActive: coupon?.isActive ?? true,
      expiresAt: coupon?.expiresAt ? toDateInputValue(coupon.expiresAt) : "",
    },
  });

  const couponType = watch("type");

  function onSubmit(data: CouponInput) {
    startTransition(async () => {
      const result = isEditing ? await updateCoupon(coupon.id, data) : await createCoupon(data);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/coupons");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coupon Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                placeholder="e.g. SUMMER25"
                className="font-mono uppercase"
                {...register("code")}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={couponType}
                onValueChange={(v) => setValue("type", v as "percentage" | "fixed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (Rs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value">
                {couponType === "percentage" ? "Discount (%)" : "Discount Amount (Rs)"}
              </Label>
              <Input
                id="value"
                type="number"
                step={couponType === "percentage" ? "1" : "0.01"}
                min={0}
                {...register("value", { valueAsNumber: true })}
              />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input id="expiresAt" type="date" {...register("expiresAt")} />
              {errors.expiresAt && (
                <p className="text-xs text-destructive">{errors.expiresAt.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Minimum Purchase (Rs)</Label>
              <Input
                id="minPurchase"
                type="number"
                min={0}
                {...register("minPurchase", { valueAsNumber: true })}
              />
              {errors.minPurchase && (
                <p className="text-xs text-destructive">{errors.minPurchase.message}</p>
              )}
            </div>
            {couponType === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Max Discount (Rs)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min={0}
                  placeholder="No limit"
                  {...register("maxDiscount", {
                    setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                  })}
                />
                <p className="text-xs text-muted-foreground">Leave empty for no limit</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                placeholder="Unlimited"
                {...register("maxUses", {
                  setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                })}
              />
              <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watch("isActive") ? "active" : "inactive"}
              onValueChange={(v) => setValue("isActive", v === "active")}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Coupon"
              : "Create Coupon"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/coupons")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
