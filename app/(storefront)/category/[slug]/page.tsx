import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductsByCategory, getPriceRange } from "@/features/catalog/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { CategoryBanner } from "@/features/catalog/components/category-banner";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { ActiveFilters } from "@/features/catalog/components/active-filters";
import { FilterSidebar } from "@/features/catalog/components/filter-sidebar";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Pagination } from "@/features/catalog/components/pagination";
import { NotFoundError } from "@/lib/errors";
import { generateBreadcrumbJsonLd } from "@/lib/structured-data";
import type { CatalogSearchParams } from "@/types/catalog";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { category } = await getProductsByCategory(slug, {});
    const description = category.description || `Shop ${category.name} products at DollarShop`;

    return {
      title: category.name,
      description,
      alternates: { canonical: `/category/${slug}` },
      openGraph: {
        title: category.name,
        description,
        ...(category.image && {
          images: [{ url: category.image, alt: category.name }],
        }),
      },
    };
  } catch {
    return { title: "Category" };
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

  const [priceRange, wishlistedIds] = await Promise.all([getPriceRange(), getWishlistProductIds()]);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: result.category.name, url: `/category/${result.category.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
          <ProductGrid products={result.products} wishlistedIds={wishlistedIds} />
          <Pagination pagination={result.pagination} />
        </div>
      </div>
    </div>
  );
}
