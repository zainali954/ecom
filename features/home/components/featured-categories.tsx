import { connectDB } from "@/lib/db";
import { Category } from "@/models/category";
import { SectionHeader } from "./section-header";
import { CategoryCard } from "./category-card";

export async function FeaturedCategories() {
  await connectDB();

  const categories = await Category.find({ isActive: true, parent: null })
    .sort({ sortOrder: 1 })
    .limit(8)
    .lean();

  if (categories.length === 0) {
    return (
      <section>
        <SectionHeader
          title="Shop by Category"
          description="Browse our collection"
          href="/categories"
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">Categories coming soon</p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        title="Shop by Category"
        description="Browse our collection"
        href="/categories"
      />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={String(category._id)}
            name={category.name}
            slug={category.slug}
            image={category.image || undefined}
          />
        ))}
      </div>
    </section>
  );
}
