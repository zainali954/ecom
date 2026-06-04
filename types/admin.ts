export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  isActive: boolean;
  emailVerified: string | null;
  createdAt: string;
}

export interface AdminUsersPageData {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}
