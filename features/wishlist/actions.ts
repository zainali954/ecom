"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Wishlist } from "@/models/wishlist";
import { Product } from "@/models/product";
import { logger } from "@/lib/logger";

interface WishlistActionResult {
  success: boolean;
  message: string;
}

export async function toggleWishlist(productId: string): Promise<WishlistActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in to manage your wishlist" };
    }

    await connectDB();

    const product = await Product.findById(productId).lean();
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    let wishlist = await Wishlist.findOne({ user: session.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: session.user.id,
        products: [productId],
      });
      revalidatePath("/wishlist");
      return { success: true, message: "Added to wishlist" };
    }

    const productIndex = wishlist.products.findIndex(
      (id: { toString: () => string }) => id.toString() === productId,
    );

    if (productIndex > -1) {
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();
      revalidatePath("/wishlist");
      return { success: true, message: "Removed from wishlist" };
    }

    wishlist.products.push(productId);
    await wishlist.save();
    revalidatePath("/wishlist");
    return { success: true, message: "Added to wishlist" };
  } catch (error) {
    logger.error("Wishlist toggle error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function removeFromWishlist(productId: string): Promise<WishlistActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in" };
    }

    await connectDB();

    await Wishlist.updateOne({ user: session.user.id }, { $pull: { products: productId } });

    revalidatePath("/wishlist");
    return { success: true, message: "Removed from wishlist" };
  } catch (error) {
    logger.error("Wishlist remove error:", error);
    return { success: false, message: "Something went wrong" };
  }
}
