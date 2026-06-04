import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderDetail } from "@/types/order";
import { ORDER_STATUS_CONFIG, PAYMENT_LABELS, PAYMENT_STATUS_LABELS } from "../constants";
import { OrderTracking } from "./order-tracking";

interface OrderDetailViewProps {
  order: OrderDetail;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const addr = order.shippingAddress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{order.orderNumber}</h2>
            <Badge variant={statusConfig.variant} className="text-xs capitalize">
              {order.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>

      {/* Tracking */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Order Tracking</h3>
        <OrderTracking status={order.status} />
      </div>

      {/* Items */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="text-sm font-semibold">Items</h3>
        <Separator className="my-3" />
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                {item.productSlug ? (
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p className="font-medium">{item.name}</p>
                )}
                {item.variantLabel && (
                  <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × Rs. {item.unitPrice.toLocaleString()}
                </p>
              </div>
              <p className="font-medium">Rs. {item.totalPrice.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs. {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {order.shippingCost === 0 ? "Free" : `Rs. ${order.shippingCost.toLocaleString()}`}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-Rs. {order.discount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>Rs. {order.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold">Shipping Address</h3>
          <Separator className="my-3" />
          <div className="space-y-0.5 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">{addr.fullName}</p>
            <p>{addr.phone}</p>
            {addr.alternatePhone && <p>{addr.alternatePhone}</p>}
            <p>{addr.addressLine1}</p>
            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>
              {addr.area}, {addr.city}
            </p>
            <p>
              {addr.province}
              {addr.postalCode && ` - ${addr.postalCode}`}
            </p>
            {addr.landmark && <p>Near: {addr.landmark}</p>}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold">Payment</h3>
          <Separator className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold">Order Notes</h3>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
