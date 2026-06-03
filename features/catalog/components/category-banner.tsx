import Image from "next/image";
import type { CatalogCategory } from "@/types/catalog";

interface CategoryBannerProps {
  category: CatalogCategory;
}

export function CategoryBanner({ category }: CategoryBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-muted">
      {category.image && (
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          priority
        />
      )}
      <div className="relative px-6 py-12 sm:px-8 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {category.productCount} {category.productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </div>
  );
}
