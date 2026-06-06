"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryOption } from "@/types/admin";

interface ProductLivePreviewProps {
  name: string;
  shortDescription: string;
  description: string;
  images: { url: string; alt: string }[];
  basePrice: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  category: string;
  categories: CategoryOption[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  productType: "simple" | "variable";
}

export function ProductLivePreview({
  name,
  shortDescription,
  description,
  images,
  basePrice,
  salePrice,
  sku,
  stock,
  category,
  categories,
  tags,
  isActive,
  isFeatured,
  isBestSeller,
  productType,
}: ProductLivePreviewProps) {
  const hasDiscount = salePrice != null && salePrice > 0 && salePrice < basePrice;
  const categoryName = categories.find((c) => c.id === category)?.name;
  const mainImage = images[0];
  const discountPercent = hasDiscount ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <EyeIcon />
        <span className="font-medium uppercase tracking-wider">Live Preview</span>
      </div>

      {/* Product image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || name || "Product"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
            <ImagePlaceholderIcon />
            <span className="text-xs">No image added</span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
            -{discountPercent}%
          </span>
        )}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-muted-foreground/30 bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground">
              Inactive
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <div
              key={i}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                i === 0 ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `Image ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {isFeatured && (
          <Badge variant="secondary" className="text-[10px]">
            Featured
          </Badge>
        )}
        {isBestSeller && (
          <Badge variant="secondary" className="text-[10px]">
            Best Seller
          </Badge>
        )}
        {productType === "variable" && (
          <Badge variant="outline" className="text-[10px]">
            Variable
          </Badge>
        )}
      </div>

      {/* Name */}
      <div>
        {categoryName && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {categoryName}
          </p>
        )}
        <h2 className="mt-1 text-xl font-semibold leading-tight">
          {name || <span className="text-muted-foreground/50">Product Name</span>}
        </h2>
        {shortDescription && (
          <p className="mt-1.5 text-sm text-muted-foreground">{shortDescription}</p>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-bold">Rs. {salePrice.toLocaleString()}</span>
            <span className="text-base text-muted-foreground line-through">
              Rs. {basePrice.toLocaleString()}
            </span>
          </>
        ) : basePrice > 0 ? (
          <span className="text-2xl font-bold">Rs. {basePrice.toLocaleString()}</span>
        ) : (
          <span className="text-2xl font-bold text-muted-foreground/40">Rs. 0</span>
        )}
      </div>

      {/* Stock & SKU */}
      {productType === "simple" && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
            <span className={stock > 0 ? "text-green-700 dark:text-green-400" : "text-red-600"}>
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </span>
          </div>
          {sku && <span className="text-muted-foreground">SKU: {sku}</span>}
        </div>
      )}

      {/* Add to cart button mock */}
      <Button className="w-full" size="lg" disabled>
        Add to Cart
      </Button>

      {/* Description */}
      {description && (
        <div className="border-t pt-4">
          <h3 className="mb-2 text-sm font-semibold">Description</h3>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {description}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="mb-2 text-sm font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ImagePlaceholderIcon() {
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
      className="opacity-50"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
