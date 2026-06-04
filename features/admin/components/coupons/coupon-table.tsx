"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCouponsPageData } from "@/types/admin";
import { CouponActions } from "./coupon-actions";

interface CouponTableProps {
  data: AdminCouponsPageData;
}

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString("en-PK")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}

export function CouponTable({ data }: CouponTableProps) {
  if (data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">No coupons found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.coupons.map((coupon) => {
              const expired = isExpired(coupon.expiresAt);
              return (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <Link
                      href={`/admin/coupons/${coupon.id}`}
                      className="font-mono font-medium hover:underline"
                    >
                      {coupon.code}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {coupon.type === "percentage" ? "Percentage" : "Fixed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {coupon.type === "percentage" ? `${coupon.value}%` : formatPrice(coupon.value)}
                    {coupon.maxDiscount != null && coupon.type === "percentage" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (max {formatPrice(coupon.maxDiscount)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {coupon.minPurchase > 0 ? formatPrice(coupon.minPurchase) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {coupon.usedCount}
                    {coupon.maxUses != null && (
                      <span className="text-muted-foreground"> / {coupon.maxUses}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(coupon.expiresAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {expired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant={coupon.isActive ? "outline" : "destructive"}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CouponActions coupon={coupon} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {data.coupons.length} of {data.total} coupons · Page {data.page} of{" "}
            {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={data.page <= 1} asChild>
              <Link href={`/admin/coupons?page=${data.page - 1}`} aria-disabled={data.page <= 1}>
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} asChild>
              <Link
                href={`/admin/coupons?page=${data.page + 1}`}
                aria-disabled={data.page >= data.totalPages}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
