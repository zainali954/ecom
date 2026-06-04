import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import type { CartData } from "@/types/cart";

interface OrderSummaryProps {
  cart: CartData;
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  const shippingCost: number = 0;
  const total = cart.subtotal + shippingCost;

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-sm font-semibold">Order Summary</h2>
      <Separator className="my-4" />

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No img
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
              {item.variantLabel && (
                <p className="text-[11px] text-muted-foreground">{item.variantLabel}</p>
              )}
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-medium">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>Rs. {cart.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shippingCost === 0 ? "Free" : `Rs. ${shippingCost.toLocaleString()}`}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>Rs. {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
