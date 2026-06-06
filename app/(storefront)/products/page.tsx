import type { Metadata } from "next";
import { getProducts, getCategoriesForFilter, getPriceRange } from "@/features/catalog/queries";
import { SearchInput } from "@/features/catalog/components/search-input";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { ActiveFilters } from "@/features/catalog/components/active-filters";
import { FilterSidebar } from "@/features/catalog/components/filter-sidebar";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Pagination } from "@/features/catalog/components/pagination";
import type { CatalogSearchParams } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our complete product collection. Find the best deals on quality products with fast delivery across Pakistan.",
  alternates: { canonical: "/products" },
};

interface ProductsPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [result, categories, priceRange] = await Promise.all([
    getProducts(params),
    getCategoriesForFilter(),
    getPriceRange(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {params.q ? `Results for "${params.q}"` : "Browse our collection"}
        </p>
      </div>

      <div className="mb-6 max-w-md">
        <SearchInput />
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterSidebar
            categories={categories}
            priceRange={priceRange}
            showCategoryFilter={true}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <CatalogToolbar
            pagination={result.pagination}
            categories={categories}
            priceRange={priceRange}
            showCategoryFilter={true}
          />
          <ActiveFilters categories={categories} />
          <ProductGrid products={result.products} />
          <Pagination pagination={result.pagination} />
        </div>
      </div>
    </div>
  );
}
