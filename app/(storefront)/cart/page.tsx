import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCart } from "@/features/cart/queries";
import { QuantityControl } from "@/features/cart/components/quantity-control";
import { RemoveCartButton } from "@/features/cart/components/remove-cart-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your shopping cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Shopping Cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cart.itemCount === 0
            ? "Your cart is empty"
            : `${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"} in your cart`}
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CartIcon />
          <p className="mt-4 text-sm text-muted-foreground">Add some products to get started</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="divide-y">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 sm:gap-6">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24"
                  >
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <PlaceholderIcon />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                    >
                      {item.productName}
                    </Link>
                    {item.variantLabel && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                    )}
                    <p className="mt-1 text-sm font-semibold">Rs. {item.price.toLocaleString()}</p>

                    <div className="mt-2 flex items-center gap-4">
                      <QuantityControl
                        itemId={item.id}
                        quantity={item.quantity}
                        maxStock={item.stock > 0 ? item.stock : 99}
                      />
                      <RemoveCartButton itemId={item.id} />
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-sm font-semibold">Order Summary</h2>
              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>Rs. {cart.subtotal.toLocaleString()}</span>
              </div>

              <Button className="mt-6 w-full" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button variant="outline" className="mt-2 w-full" size="sm" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground/40"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function PlaceholderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-30"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
