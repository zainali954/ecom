"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/features/orders/constants";
import type { AdminOrder, AdminOrderItem } from "@/types/admin";
import type { OrderStatus, PaymentStatus } from "@/types/order";
import { updateOrderStatus, updatePaymentStatus, updateOrderNotes } from "../../actions/orders";

interface OrderDetailViewProps {
  order: AdminOrder & { items: AdminOrderItem[] };
}

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString("en-PK")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [notes, setNotes] = useState(order.notes);

  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];
  const isTerminal = order.status === "cancelled" || order.status === "refunded";

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handlePaymentChange(status: string) {
    startTransition(async () => {
      const result = await updatePaymentStatus(order.id, status);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      const result = await updateOrderNotes(order.id, notes);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={statusConfig?.variant ?? "secondary"} className="text-sm">
            {statusConfig?.label ?? order.status}
          </Badge>
          <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Items + Summary */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-medium">Order Items</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{item.sku || "—"}</span>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">{formatPrice(item.totalPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator />
            <div className="space-y-2 px-6 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 text-sm font-medium">Order Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this order..."
              rows={3}
            />
            <Button
              size="sm"
              className="mt-3"
              onClick={handleSaveNotes}
              disabled={isPending || notes === order.notes}
            >
              {isPending ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-sm font-medium">Update Status</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Order Status</label>
                <Select
                  value={order.status}
                  onValueChange={handleStatusChange}
                  disabled={isPending || isTerminal}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Payment Status</label>
                <Select
                  value={order.paymentStatus}
                  onValueChange={handlePaymentChange}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 text-sm font-medium">Customer</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 text-sm font-medium">Payment</h2>
            <div className="space-y-1 text-sm">
              <p>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
              <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 text-sm font-medium">Shipping Address</h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.area}, {order.shippingAddress.city}
              </p>
              <p>
                {order.shippingAddress.province}
                {order.shippingAddress.postalCode && ` — ${order.shippingAddress.postalCode}`}
              </p>
              {order.shippingAddress.landmark && <p>Near: {order.shippingAddress.landmark}</p>}
              <Separator className="my-2" />
              <p>{order.shippingAddress.phone}</p>
              {order.shippingAddress.alternatePhone && (
                <p>{order.shippingAddress.alternatePhone}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
