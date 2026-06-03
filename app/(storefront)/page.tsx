import { Suspense } from "react";
import { HeroSection } from "@/features/home/components/hero-section";
import { FeaturedCategories } from "@/features/home/components/featured-categories";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { PromotionalBanners } from "@/features/home/components/promotional-banners";

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="min-h-[320px] animate-pulse rounded-xl bg-muted sm:min-h-[400px]" />
        }
      >
        <HeroSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedCategories />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedProducts
          title="New Arrivals"
          description="Fresh picks just for you"
          filter={{}}
          href="/products"
        />
      </Suspense>

      <Suspense fallback={null}>
        <PromotionalBanners />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedProducts
          title="Best Sellers"
          description="Our most popular products"
          filter={{ isBestSeller: true }}
          href="/products?sort=best-sellers"
        />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedProducts
          title="Featured"
          description="Handpicked by our team"
          filter={{ isFeatured: true }}
          href="/products?sort=featured"
        />
      </Suspense>
    </div>
  );
}
