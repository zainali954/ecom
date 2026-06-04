"use server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { Order } from "@/models/order";
import { revalidatePath } from "next/cache";

const VALID_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  await connectDB();

  if (!VALID_ORDER_STATUSES.includes(status as (typeof VALID_ORDER_STATUSES)[number])) {
    return { success: false, message: "Invalid order status" };
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return { success: false, message: "Order not found" };
  }

  if (order.status === "delivered" && status !== "refunded") {
    return { success: false, message: "Delivered orders can only be refunded" };
  }

  if (order.status === "cancelled") {
    return { success: false, message: "Cancelled orders cannot be updated" };
  }

  if (order.status === "refunded") {
    return { success: false, message: "Refunded orders cannot be updated" };
  }

  order.status = status;

  if (status === "cancelled" || status === "refunded") {
    order.paymentStatus = status === "refunded" ? "refunded" : order.paymentStatus;
  }

  await order.save();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");

  return { success: true, message: `Order status updated to ${status}` };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  await requireAdmin();
  await connectDB();

  if (!VALID_PAYMENT_STATUSES.includes(paymentStatus as (typeof VALID_PAYMENT_STATUSES)[number])) {
    return { success: false, message: "Invalid payment status" };
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return { success: false, message: "Order not found" };
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");

  return { success: true, message: `Payment status updated to ${paymentStatus}` };
}

export async function updateOrderNotes(orderId: string, notes: string) {
  await requireAdmin();
  await connectDB();

  const order = await Order.findById(orderId);
  if (!order) {
    return { success: false, message: "Order not found" };
  }

  order.notes = notes.trim();
  await order.save();

  revalidatePath(`/admin/orders/${orderId}`);

  return { success: true, message: "Order notes updated" };
}
