import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart — DollarShop",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Shopping Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your cart is empty</p>
    </div>
  );
}
