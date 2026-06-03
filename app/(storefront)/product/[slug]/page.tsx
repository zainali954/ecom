import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/features/product/queries";
import { ProductGallery } from "@/features/product/components/product-gallery";
import { ProductInfo } from "@/features/product/components/product-info";
import { ProductDescription } from "@/features/product/components/product-description";
import { RelatedProducts } from "@/features/product/components/related-products";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { NotFoundError } from "@/lib/errors";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.name} — DollarShop`,
      description: product.shortDescription || product.description || `Shop ${product.name}`,
    };
  } catch {
    return { title: "Product — DollarShop" };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const [relatedProducts, wishlistIds] = await Promise.all([
    getRelatedProducts(product.id, product.category.id),
    getWishlistProductIds(),
  ]);

  const isWishlisted = wishlistIds.has(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Product info */}
        <ProductInfo product={product} isWishlisted={isWishlisted} />
      </div>

      {/* Description */}
      <div className="mt-12">
        <ProductDescription description={product.description} />
      </div>

      {/* Related products */}
      <div className="mt-12">
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
