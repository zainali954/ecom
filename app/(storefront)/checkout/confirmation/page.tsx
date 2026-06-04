import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrderConfirmation } from "@/features/checkout/queries-confirmation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Order Confirmed — DollarShop",
  description: "Your order has been placed successfully",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  "bank-transfer": "Bank Transfer",
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const orderId = params.orderId;
  if (!orderId) redirect("/");

  const order = await getOrderConfirmation(orderId);
  if (!order) redirect("/");

  const addr = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckIcon />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Order Confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for your order! Your order number is{" "}
          <span className="font-medium text-foreground">{order.orderNumber}</span>
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {/* Order Items */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-semibold">Items Ordered</h2>
          <Separator className="my-3" />
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
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
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-sm font-semibold">Shipping Address</h2>
            <Separator className="my-3" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">{addr.fullName}</p>
              <p>{addr.phone}</p>
              <p>{addr.addressLine1}</p>
              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
              <p>
                {addr.area}, {addr.city}
              </p>
              <p>
                {addr.province}
                {addr.postalCode && ` - ${addr.postalCode}`}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-sm font-semibold">Payment</h2>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="text-xs capitalize">
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
          <Button asChild size="sm">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/account/orders">View Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-600"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
