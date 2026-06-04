import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import type { AdminUser, AdminUsersPageData } from "@/types/admin";

const USERS_PER_PAGE = 15;

export async function getAdminUsers(
  page = 1,
  search?: string,
  role?: string,
  status?: string,
): Promise<AdminUsersPageData> {
  await connectDB();

  const filter: Record<string, unknown> = {};

  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [{ name: regex }, { email: regex }];
  }

  if (role && role !== "all") {
    filter.role = role;
  }

  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  const [docs, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * USERS_PER_PAGE)
      .limit(USERS_PER_PAGE)
      .lean(),
    User.countDocuments(filter),
  ]);

  const users: AdminUser[] = docs.map((doc) => {
    const d = doc as Record<string, unknown>;
    return {
      id: String(d._id),
      name: d.name as string,
      email: d.email as string,
      role: d.role as "customer" | "admin",
      isActive: d.isActive as boolean,
      emailVerified: d.emailVerified ? new Date(d.emailVerified as string).toISOString() : null,
      createdAt: d.createdAt
        ? new Date(d.createdAt as string).toISOString()
        : new Date().toISOString(),
    };
  });

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / USERS_PER_PAGE),
  };
}

export async function getAdminUserById(userId: string): Promise<AdminUser | null> {
  await connectDB();

  const doc = await User.findById(userId).lean();
  if (!doc) return null;

  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    name: d.name as string,
    email: d.email as string,
    role: d.role as "customer" | "admin",
    isActive: d.isActive as boolean,
    emailVerified: d.emailVerified ? new Date(d.emailVerified as string).toISOString() : null,
    createdAt: d.createdAt
      ? new Date(d.createdAt as string).toISOString()
      : new Date().toISOString(),
  };
}
