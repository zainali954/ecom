import { ProductCard } from "@/features/home/components/product-card";
import type { CatalogProduct } from "@/types/catalog";

interface ProductGridProps {
  products: CatalogProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">No products found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={product.basePrice}
          salePrice={product.salePrice}
          image={product.image}
        />
      ))}
    </div>
  );
}
