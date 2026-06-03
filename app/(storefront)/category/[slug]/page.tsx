import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductsByCategory, getPriceRange } from "@/features/catalog/queries";
import { CategoryBanner } from "@/features/catalog/components/category-banner";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { ActiveFilters } from "@/features/catalog/components/active-filters";
import { FilterSidebar } from "@/features/catalog/components/filter-sidebar";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Pagination } from "@/features/catalog/components/pagination";
import { NotFoundError } from "@/lib/errors";
import type { CatalogSearchParams } from "@/types/catalog";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { category } = await getProductsByCategory(slug, {});
    return {
      title: `${category.name} — DollarShop`,
      description: category.description || `Shop ${category.name} products`,
    };
  } catch {
    return { title: "Category — DollarShop" };
  }
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);

  let result;
  try {
    result = await getProductsByCategory(slug, queryParams);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const priceRange = await getPriceRange();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <CategoryBanner category={result.category} />

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterSidebar priceRange={priceRange} showCategoryFilter={false} />
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <CatalogToolbar
            pagination={result.pagination}
            priceRange={priceRange}
            showCategoryFilter={false}
          />
          <ActiveFilters />
          <ProductGrid products={result.products} />
          <Pagination pagination={result.pagination} />
        </div>
      </div>
    </div>
  );
}
