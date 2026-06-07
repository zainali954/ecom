import { ProductCard } from "@/features/home/components/product-card";
import { Separator } from "@/components/ui/separator";
import type { CatalogProduct } from "@/types/catalog";

interface RelatedProductsProps {
  products: CatalogProduct[];
  wishlistedIds?: Set<string>;
}

export function RelatedProducts({ products, wishlistedIds = new Set() }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <Separator />
      <div>
        <h2 className="text-lg font-semibold">Related Products</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.basePrice}
              salePrice={product.salePrice}
              image={product.image}
              isWishlisted={wishlistedIds.has(product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
