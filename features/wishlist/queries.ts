import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Wishlist } from "@/models/wishlist";
import type { CatalogProduct } from "@/types/catalog";

export async function getWishlistProducts(): Promise<CatalogProduct[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const wishlist = await Wishlist.findOne({ user: session.user.id })
    .populate({
      path: "products",
      match: { isActive: true },
      populate: { path: "category", select: "name slug" },
    })
    .lean();

  if (!wishlist || !wishlist.products) return [];

  return (wishlist.products as Array<Record<string, unknown>>)
    .filter((p) => p !== null)
    .map((doc) => {
      const category = doc.category as Record<string, unknown> | null;
      const images = (doc.images as Array<Record<string, unknown>>) ?? [];

      return {
        id: String(doc._id),
        name: doc.name as string,
        slug: doc.slug as string,
        basePrice: doc.basePrice as number,
        salePrice: (doc.salePrice as number) ?? null,
        image: images.length > 0 ? (images[0].url as string) : undefined,
        categorySlug: category ? (category.slug as string) : "",
        categoryName: category ? (category.name as string) : "",
        createdAt: doc.createdAt ? (doc.createdAt as Date).toISOString() : "",
      };
    });
}

export async function getWishlistProductIds(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user?.id) return new Set();

  await connectDB();

  const wishlist = await Wishlist.findOne({ user: session.user.id }).select("products").lean();

  if (!wishlist || !wishlist.products) return new Set();

  return new Set(
    (wishlist.products as Array<{ toString: () => string }>).map((id) => id.toString()),
  );
}
