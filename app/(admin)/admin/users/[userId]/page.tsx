import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getAdminUserById } from "@/features/admin/queries";
import { UserDetailView } from "@/features/admin/components/users/user-detail-view";
import { Button } from "@/components/ui/button";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await requireAdmin();
  const { userId } = await params;

  const user = await getAdminUserById(userId);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users">← Back to Users</Link>
        </Button>
      </div>

      <UserDetailView user={user} isSelf={user.id === session.user.id} />
    </div>
  );
}
