import type { Metadata } from "next";
import { getAllCategories } from "@/features/catalog/queries";
import { CategoryCard } from "@/features/home/components/category-card";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse all product categories. Shop by category to find exactly what you need at DollarShop.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">All Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Shop by category</p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No categories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              image={category.image || undefined}
              productCount={category.productCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
