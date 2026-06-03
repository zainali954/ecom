import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist — DollarShop",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your wishlist is empty</p>
    </div>
  );
}
