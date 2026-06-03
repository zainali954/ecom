import { connectDB } from "@/lib/db";
import { Product } from "@/models/product";
import { SectionHeader } from "./section-header";
import { ProductCard } from "./product-card";

interface FeaturedProductsProps {
  title: string;
  description?: string;
  filter: Record<string, unknown>;
  href?: string;
}

export async function FeaturedProducts({
  title,
  description,
  filter,
  href,
}: FeaturedProductsProps) {
  await connectDB();

  const products = await Product.find({ isActive: true, ...filter })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  if (products.length === 0) {
    return (
      <section>
        <SectionHeader title={title} description={description} href={href} />
        <p className="mt-6 text-center text-sm text-muted-foreground">No products yet</p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title={title} description={description} href={href} />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={String(product._id)}
            id={String(product._id)}
            name={product.name}
            slug={product.slug}
            price={product.basePrice}
            salePrice={product.salePrice}
            image={product.images?.[0]?.url}
          />
        ))}
      </div>
    </section>
  );
}
