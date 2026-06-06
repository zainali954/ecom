import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCheckoutData } from "@/features/checkout/queries";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { cart, addresses } = await getCheckoutData();

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add some products before checking out</p>
        <Button asChild className="mt-6" size="sm">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your order and complete the purchase
        </p>
      </div>

      <CheckoutForm cart={cart} addresses={addresses} />
    </div>
  );
}
