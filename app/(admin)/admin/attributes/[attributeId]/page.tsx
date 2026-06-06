import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getAdminAttribute } from "@/features/admin/queries/attributes";
import { AttributeForm } from "@/features/admin/components/attributes/attribute-form";
import { Button } from "@/components/ui/button";

export default async function AdminEditAttributePage({
  params,
}: {
  params: Promise<{ attributeId: string }>;
}) {
  await requireAdmin();
  const { attributeId } = await params;

  const attribute = await getAdminAttribute(attributeId);
  if (!attribute) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/attributes">← Back to Attributes</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Attribute</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update {attribute.name}</p>
      </div>

      <AttributeForm attribute={attribute} />
    </div>
  );
}
