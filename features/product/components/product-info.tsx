"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VariantSelector } from "./variant-selector";
import { StockStatus } from "./stock-status";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import type { ProductDetail, ProductVariantDetail } from "@/types/product";

interface ProductInfoProps {
  product: ProductDetail;
  isWishlisted: boolean;
}

export function ProductInfo({ product, isWishlisted }: ProductInfoProps) {
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
        <AddToCartButton
          productId={product.id}
          variantId={selectedVariant?.id ?? null}
          disabled={!canAddToCart}
          label={
            currentStock <= 0 && (!isVariable || selectedVariant)
              ? "Out of stock"
              : isVariable && !selectedVariant
                ? "Select options"
                : "Add to cart"
          }
        />
        <WishlistButton productId={product.id} isWishlisted={isWishlisted} variant="default" />
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
