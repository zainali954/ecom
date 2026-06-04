"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Cart } from "@/models/cart";
import { Product } from "@/models/product";
import { ProductVariant } from "@/models/product-variant";
import { Inventory } from "@/models/inventory";
import { logger } from "@/lib/logger";

interface CartActionResult {
  success: boolean;
  message: string;
}

export async function addToCart(
  productId: string,
  variantId: string | null,
  quantity: number = 1,
): Promise<CartActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in to add items to cart" };
    }

    await connectDB();

    const product = await Product.findById(productId).lean();
    if (!product || !(product as Record<string, unknown>).isActive) {
      return { success: false, message: "Product not found" };
    }

    let price: number;

    if (variantId) {
      const variant = await ProductVariant.findById(variantId).lean();
      if (!variant || !(variant as Record<string, unknown>).isActive) {
        return { success: false, message: "Variant not found" };
      }
      const v = variant as Record<string, unknown>;
      price = (v.salePrice as number) ?? (v.price as number);
    } else {
      const p = product as Record<string, unknown>;
      price = (p.salePrice as number) ?? (p.basePrice as number);
    }

    const inv = await Inventory.findOne({ product: productId, variant: variantId ?? null }).lean();
    const availableStock = inv ? ((inv as Record<string, unknown>).stock as number) : 0;

    if (quantity > availableStock) {
      return { success: false, message: `Only ${availableStock} available in stock` };
    }

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: [{ product: productId, variant: variantId, quantity, price }],
      });
      revalidatePath("/cart");
      revalidatePath("/", "layout");
      return { success: true, message: "Added to cart" };
    }

    const existingIndex = cart.items.findIndex(
      (item: { product: { toString: () => string }; variant: { toString: () => string } | null }) =>
        item.product.toString() === productId &&
        (variantId ? item.variant?.toString() === variantId : !item.variant),
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > availableStock) {
        return { success: false, message: `Only ${availableStock} available in stock` };
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = price;
    } else {
      cart.items.push({ product: productId, variant: variantId, quantity, price });
    }

    await cart.save();
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Added to cart" };
  } catch (error) {
    logger.error("Add to cart error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<CartActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in" };
    }

    if (quantity < 1) {
      return { success: false, message: "Quantity must be at least 1" };
    }

    await connectDB();

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) return { success: false, message: "Cart not found" };

    const item = cart.items.id(itemId);
    if (!item) return { success: false, message: "Item not found" };

    item.quantity = quantity;
    await cart.save();

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Quantity updated" };
  } catch (error) {
    logger.error("Update cart quantity error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function removeCartItem(itemId: string): Promise<CartActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in" };
    }

    await connectDB();

    await Cart.updateOne({ user: session.user.id }, { $pull: { items: { _id: itemId } } });

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Removed from cart" };
  } catch (error) {
    logger.error("Remove cart item error:", error);
    return { success: false, message: "Something went wrong" };
  }
}
