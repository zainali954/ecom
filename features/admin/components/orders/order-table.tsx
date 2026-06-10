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
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/features/orders/constants";
import type { AdminOrdersPageData } from "@/types/admin";
import type { OrderStatus, PaymentStatus } from "@/types/order";
import { OrderActions } from "./order-actions";

interface OrderTableProps {
  data: AdminOrdersPageData;
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

function getPaymentBadgeVariant(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "failed":
    case "refunded":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function OrderTable({ data }: OrderTableProps) {
  if (data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.orders.map((order) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig?.variant ?? "secondary"}>
                      {statusConfig?.label ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <OrderActions order={order} />
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
            Showing {data.orders.length} of {data.total} orders · Page {data.page} of{" "}
            {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={data.page <= 1} asChild>
              <Link href={`/admin/orders?page=${data.page - 1}`} aria-disabled={data.page <= 1}>
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} asChild>
              <Link
                href={`/admin/orders?page=${data.page + 1}`}
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
