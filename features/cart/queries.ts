import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Cart } from "@/models/cart";
import { Inventory } from "@/models/inventory";
import "@/models/product";
import "@/models/product-variant";
import "@/models/product-attribute";
import "@/models/product-attribute-value";
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
      select: "attributes isActive",
      populate: {
        path: "attributes.attribute attributes.value",
        select: "name value",
      },
    })
    .lean();

  if (!cart || !cart.items || cart.items.length === 0) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  const productIds = (cart.items as Array<Record<string, unknown>>)
    .map((i) => (i.product ? String((i.product as Record<string, unknown>)._id) : null))
    .filter(Boolean);
  const variantIds = (cart.items as Array<Record<string, unknown>>)
    .map((i) => (i.variant ? String((i.variant as Record<string, unknown>)._id) : null))
    .filter(Boolean);

  const invDocs = await Inventory.find({
    $or: [{ product: { $in: productIds }, variant: null }, { variant: { $in: variantIds } }],
  }).lean();

  const stockMap = new Map<string, number>();
  for (const inv of invDocs) {
    const key = inv.variant ? String(inv.variant) : `p_${String(inv.product)}`;
    stockMap.set(key, (inv as Record<string, unknown>).stock as number);
  }

  const items: CartItem[] = [];
  const staleItemIds: string[] = [];
  let subtotal = 0;

  for (const item of cart.items as Array<Record<string, unknown>>) {
    const product = item.product as Record<string, unknown> | null;
    if (!product || !(product.isActive as boolean)) {
      staleItemIds.push(String(item._id));
      continue;
    }

    const images = (product.images as Array<Record<string, unknown>>) ?? [];
    const variant = item.variant as Record<string, unknown> | null;
    const quantity = item.quantity as number;
    const price = item.price as number;

    let variantLabel = "";
    let stock = 0;

    if (variant) {
      if (!(variant.isActive as boolean)) {
        staleItemIds.push(String(item._id));
        continue;
      }
      stock = stockMap.get(String(variant._id)) ?? 0;
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
    } else {
      stock = stockMap.get(`p_${String(product._id)}`) ?? 0;
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

  if (staleItemIds.length > 0) {
    await Cart.updateOne(
      { user: session.user.id },
      { $pull: { items: { _id: { $in: staleItemIds } } } },
    );
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

  const cart = await Cart.findOne({ user: session.user.id })
    .select("items")
    .populate({ path: "items.product", select: "isActive" })
    .populate({ path: "items.variant", select: "isActive" })
    .lean();
  if (!cart || !cart.items) return 0;

  return (cart.items as Array<Record<string, unknown>>).reduce((sum, item) => {
    const product = item.product as Record<string, unknown> | null;
    if (!product || !(product.isActive as boolean)) return sum;
    const variant = item.variant as Record<string, unknown> | null;
    if (variant && !(variant.isActive as boolean)) return sum;
    return sum + ((item.quantity as number) ?? 1);
  }, 0);
}
