import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  image?: string;
}

export function ProductCard({ name, slug, price, salePrice, image }: ProductCardProps) {
  const hasDiscount = salePrice != null && salePrice < price;

  return (
    <Link href={`/product/${slug}`} className="group block space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <PlaceholderIcon />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:underline">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold">Rs. {salePrice.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground line-through">
                Rs. {price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">Rs. {price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function PlaceholderIcon() {
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
      className="opacity-30"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
