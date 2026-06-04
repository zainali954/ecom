"use server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { User } from "@/models/user";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: string) {
  await requireAdmin();
  await connectDB();

  const user = await User.findById(userId);
  if (!user) return { success: false, message: "User not found" };

  user.isActive = !user.isActive;
  await user.save();

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return {
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
  };
}

export async function updateUserRole(userId: string, role: "customer" | "admin") {
  const session = await requireAdmin();
  await connectDB();

  if (session.user.id === userId) {
    return { success: false, message: "You cannot change your own role" };
  }

  const user = await User.findById(userId);
  if (!user) return { success: false, message: "User not found" };

  user.role = role;
  await user.save();

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return {
    success: true,
    message: `User role updated to ${role}`,
  };
}
