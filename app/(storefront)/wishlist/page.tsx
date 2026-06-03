import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getWishlistProducts } from "@/features/wishlist/queries";
import { RemoveWishlistButton } from "@/features/wishlist/components/remove-wishlist-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wishlist — DollarShop",
  description: "Your saved products",
};

export default async function WishlistPage() {
  const products = await getWishlistProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length === 0
            ? "Your wishlist is empty"
            : `${products.length} ${products.length === 1 ? "item" : "items"} saved`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <EmptyHeartIcon />
          <p className="mt-4 text-sm text-muted-foreground">Products you save will appear here</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {products.map((product) => {
            const hasDiscount = product.salePrice != null && product.salePrice < product.basePrice;

            return (
              <div key={product.id} className="flex items-center gap-4 py-4 sm:gap-6">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24"
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
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
                    href={`/product/${product.slug}`}
                    className="text-sm font-medium hover:underline line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  {product.categoryName && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{product.categoryName}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-sm font-semibold">
                          Rs. {product.salePrice!.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          Rs. {product.basePrice.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold">
                        Rs. {product.basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hidden h-8 text-xs sm:flex"
                  >
                    <Link href={`/product/${product.slug}`}>View</Link>
                  </Button>
                  <RemoveWishlistButton productId={product.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyHeartIcon() {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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
