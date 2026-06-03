import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Cart } from "@/models/cart";
import type { CartData, CartItem } from "@/types/cart";

export async function getCart(): Promise<CartData> {
  const session = await auth();
  if (!session?.user?.id) return { items: [], subtotal: 0, itemCount: 0 };

  await connectDB();

  const cart = await Cart.findOne({ user: session.user.id })
    .populate({
      path: "items.product",
      select: "name slug images isActive",
    })
    .populate({
      path: "items.variant",
      select: "attributes stock isActive",
      populate: {
        path: "attributes.attribute attributes.value",
        select: "name value",
      },
    })
    .lean();

  if (!cart || !cart.items || cart.items.length === 0) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  const items: CartItem[] = [];
  let subtotal = 0;

  for (const item of cart.items as Array<Record<string, unknown>>) {
    const product = item.product as Record<string, unknown> | null;
    if (!product || !(product.isActive as boolean)) continue;

    const images = (product.images as Array<Record<string, unknown>>) ?? [];
    const variant = item.variant as Record<string, unknown> | null;
    const quantity = item.quantity as number;
    const price = item.price as number;

    let variantLabel = "";
    let stock = 0;

    if (variant) {
      if (!(variant.isActive as boolean)) continue;
      stock = (variant.stock as number) ?? 0;
      const attrs = (variant.attributes as Array<Record<string, unknown>>) ?? [];
      variantLabel = attrs
        .map((a) => {
          const attrDoc = a.attribute as Record<string, unknown> | null;
          const valDoc = a.value as Record<string, unknown> | null;
          if (!attrDoc || !valDoc) return "";
          return `${attrDoc.name}: ${valDoc.value}`;
        })
        .filter(Boolean)
        .join(", ");
    }

    const lineTotal = price * quantity;
    subtotal += lineTotal;

    items.push({
      id: String(item._id),
      productId: String(product._id),
      productName: product.name as string,
      productSlug: product.slug as string,
      productImage: images.length > 0 ? (images[0].url as string) : undefined,
      variantId: variant ? String(variant._id) : null,
      variantLabel,
      quantity,
      price,
      stock,
    });
  }

  return {
    items,
    subtotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function getCartItemCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  await connectDB();

  const cart = await Cart.findOne({ user: session.user.id }).select("items").lean();
  if (!cart || !cart.items) return 0;

  return (cart.items as Array<{ quantity: number }>).reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0,
  );
}
