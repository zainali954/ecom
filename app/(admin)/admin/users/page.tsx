import { requireAdmin } from "@/lib/admin-guard";
import { getAdminUsers } from "@/features/admin/queries";
import { UserTable } from "@/features/admin/components/users/user-table";
import { UserFilters } from "@/features/admin/components/users/user-filters";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string; status?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const data = await getAdminUsers(page, params.search, params.role, params.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage registered users</p>
      </div>

      <UserFilters />
      <UserTable data={data} currentUserId={session.user.id} />
    </div>
  );
}
