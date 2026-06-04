"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrdersPageData } from "@/types/order";
import { useRouter, useSearchParams } from "next/navigation";
import { ORDER_STATUS_CONFIG, PAYMENT_LABELS } from "../constants";

interface OrderListProps {
  data: OrdersPageData;
}

export function OrderList({ data }: OrderListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "all";

  const statuses = [
    "all",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ] as const;

  function handleStatusFilter(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.delete("page");
    router.push(`/account/orders?${params.toString()}`);
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`/account/orders?${params.toString()}`);
  }

  if (data.total === 0 && currentStatus === "all") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              currentStatus === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {data.orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No orders found with this status.
        </p>
      ) : (
        <div className="space-y-3">
          {data.orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{order.orderNumber}</span>
                      <Badge
                        variant={statusConfig?.variant ?? "secondary"}
                        className="text-xs capitalize"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                      {" · "}
                      {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">Rs. {order.total.toLocaleString()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {data.totalPages > 1 && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => handlePageChange(data.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => handlePageChange(data.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
