import { requireAdmin } from "@/lib/admin-guard";
import { ensureDefaultAttributes } from "@/features/admin/actions/attributes";
import { getAdminAttributes } from "@/features/admin/queries/attributes";
import { AttributeTable } from "@/features/admin/components/attributes/attribute-table";
import { AttributeFilters } from "@/features/admin/components/attributes/attribute-filters";

export default async function AdminAttributesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await requireAdmin();
  await ensureDefaultAttributes();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const data = await getAdminAttributes(page, params.search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attributes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage product attributes and their values
        </p>
      </div>

      <AttributeFilters />
      <AttributeTable data={data} />
    </div>
  );
}
