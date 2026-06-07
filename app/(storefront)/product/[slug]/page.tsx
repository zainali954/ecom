import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/features/product/queries";
import { ProductGallery } from "@/features/product/components/product-gallery";
import { ProductInfo } from "@/features/product/components/product-info";
import { ProductDescription } from "@/features/product/components/product-description";
import { RelatedProducts } from "@/features/product/components/related-products";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { NotFoundError } from "@/lib/errors";
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/structured-data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    const description =
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      `Shop ${product.name} at DollarShop`;

    return {
      title: product.name,
      description,
      alternates: { canonical: `/product/${product.slug}` },
      openGraph: {
        title: product.name,
        description,
        images: product.images.map((img) => ({
          url: img.url,
          alt: img.alt || product.name,
        })),
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      (error instanceof Error &&
        "statusCode" in error &&
        (error as { statusCode: number }).statusCode === 404)
    )
      notFound();
    throw error;
  }

  const [relatedProducts, wishlistIds] = await Promise.all([
    getRelatedProducts(product.id, product.category.id),
    getWishlistProductIds(),
  ]);

  const isWishlisted = wishlistIds.has(product.id);

  const productJsonLd = generateProductJsonLd(product);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: product.category.name, url: `/category/${product.category.slug}` },
    { name: product.name, url: `/product/${product.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
