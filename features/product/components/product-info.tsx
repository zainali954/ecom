"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VariantSelector } from "./variant-selector";
import { StockStatus } from "./stock-status";
import type { ProductDetail, ProductVariantDetail } from "@/types/product";

interface ProductInfoProps {
  product: ProductDetail;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDetail | null>(null);

  const isVariable = product.type === "variable";

  const displayPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const displaySalePrice = selectedVariant ? selectedVariant.salePrice : product.salePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const hasDiscount = displaySalePrice != null && displaySalePrice < displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(((displayPrice - displaySalePrice) / displayPrice) * 100)
    : 0;

  const canAddToCart = isVariable ? selectedVariant !== null && currentStock > 0 : currentStock > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/products" className="hover:underline">
          Products
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Name */}
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-semibold">Rs. {displaySalePrice.toLocaleString()}</span>
            <span className="text-base text-muted-foreground line-through">
              Rs. {displayPrice.toLocaleString()}
            </span>
            <Badge variant="secondary" className="text-xs">
              -{discountPercent}%
            </Badge>
          </>
        ) : (
          <span className="text-2xl font-semibold">Rs. {displayPrice.toLocaleString()}</span>
        )}
      </div>

      {/* Short description */}
      {product.shortDescription && (
        <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>
      )}

      <Separator />

      {/* Variant selector */}
      {isVariable && product.attributes.length > 0 && (
        <>
          <VariantSelector
            attributes={product.attributes}
            variants={product.variants}
            onVariantChange={setSelectedVariant}
          />
          <Separator />
        </>
      )}

      {/* Stock status */}
      <div className="space-y-3">
        {isVariable && !selectedVariant ? (
          <p className="text-xs text-muted-foreground">Select options to see availability</p>
        ) : (
          <StockStatus stock={currentStock} />
        )}
      </div>

      {/* Add to cart / Wishlist */}
      <div className="flex gap-3">
        <Button size="lg" className="flex-1" disabled={!canAddToCart}>
          {currentStock <= 0 && (!isVariable || selectedVariant)
            ? "Out of stock"
            : isVariable && !selectedVariant
              ? "Select options"
              : "Add to cart"}
        </Button>
        <Button variant="outline" size="lg">
          <HeartIcon />
        </Button>
      </div>

      {/* SKU & Tags */}
      {product.sku && !isVariable && (
        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
      )}

      {product.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Tags:</span>
          {product.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
