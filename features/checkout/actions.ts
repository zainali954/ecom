"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { placeOrderSchema } from "@/schemas/checkout";
import { Cart } from "@/models/cart";
import { Product } from "@/models/product";
import { ProductVariant } from "@/models/product-variant";
import { Inventory } from "@/models/inventory";
import { Address } from "@/models/address";
import { Order } from "@/models/order";
import { OrderItem } from "@/models/order-item";
import type { PlaceOrderInput, OrderResult } from "@/types/checkout";
import type { ApiResponse } from "@/types/api";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DS-${timestamp}-${random}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<ApiResponse<OrderResult>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Please log in to place an order" };
  }

  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, message: firstError };
  }

  const { addressId, paymentMethod, notes } = parsed.data;

  await connectDB();

  try {
    const [cart, address] = await Promise.all([
      Cart.findOne({ user: session.user.id }),
      Address.findOne({ _id: addressId, user: session.user.id }).lean(),
    ]);

    if (!cart || !cart.items || cart.items.length === 0) {
      return { success: false, message: "Your cart is empty" };
    }

    if (!address) {
      return { success: false, message: "Shipping address not found" };
    }

    let subtotal = 0;
    const orderItems: Array<{
      product: string;
      variant: string | null;
      name: string;
      sku: string;
      variantLabel: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of cart.items as Array<Record<string, unknown>>) {
      const productId = String(item.product);
      const variantId = item.variant ? String(item.variant) : null;
      const quantity = item.quantity as number;

      const product = await Product.findById(productId).lean();
      if (!product || !(product as Record<string, unknown>).isActive) {
        return {
          success: false,
          message: `A product in your cart is no longer available. Please review your cart.`,
        };
      }

      const p = product as Record<string, unknown>;
      let unitPrice: number;
      let sku: string;
      let variantLabel = "";

      if (variantId) {
        const variant = await ProductVariant.findById(variantId)
          .populate({
            path: "attributes.attribute attributes.value",
            select: "name value",
          })
          .lean();

        if (!variant || !(variant as Record<string, unknown>).isActive) {
          return {
            success: false,
            message: `A variant in your cart is no longer available. Please review your cart.`,
          };
        }

        const v = variant as Record<string, unknown>;
        unitPrice = (v.salePrice as number) ?? (v.price as number);
        sku = (v.sku as string) || (p.sku as string) || "";

        const attrs = (v.attributes as Array<Record<string, unknown>>) ?? [];
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
        unitPrice = (p.salePrice as number) ?? (p.basePrice as number);
        sku = (p.sku as string) || "";
      }

      const inv = await Inventory.findOne({
        product: productId,
        variant: variantId ?? null,
      }).lean();

      const currentStock = inv ? ((inv as Record<string, unknown>).stock as number) : 0;
      if (quantity > currentStock) {
        return {
          success: false,
          message: `"${p.name}"${variantLabel ? ` (${variantLabel})` : ""} only has ${currentStock} in stock`,
        };
      }

      await Inventory.updateOne(
        { product: productId, variant: variantId ?? null },
        { $inc: { stock: -quantity } },
      );

      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: productId,
        variant: variantId,
        name: p.name as string,
        sku,
        variantLabel,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    const shippingCost = 0;
    const discount = 0;
    const total = subtotal + shippingCost - discount;

    const order = await Order.create({
      user: session.user.id,
      orderNumber: generateOrderNumber(),
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        alternatePhone: address.alternatePhone ?? "",
        province: address.province,
        city: address.city,
        area: address.area,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 ?? "",
        postalCode: address.postalCode ?? "",
        landmark: address.landmark ?? "",
      },
      status: "pending",
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      paymentStatus: "pending",
      notes: notes || "",
    });

    const orderId = order._id;

    await OrderItem.insertMany(orderItems.map((item) => ({ ...item, order: orderId })));

    cart.items = [];
    await cart.save();

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    revalidatePath("/account/orders");

    const orderNumber = order.orderNumber as string;
    const orderIdStr = String(orderId);

    redirect(`/checkout/confirmation?orderId=${orderIdStr}`);

    return {
      success: true,
      message: "Order placed successfully",
      data: { orderId: orderIdStr, orderNumber },
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as Record<string, unknown>).digest === "string" &&
      ((error as Record<string, unknown>).digest as string).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    logger.error("Place order error:", error);
    return { success: false, message: "Something went wrong while placing your order" };
  }
}
