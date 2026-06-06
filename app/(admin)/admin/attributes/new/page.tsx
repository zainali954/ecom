import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { AttributeForm } from "@/features/admin/components/attributes/attribute-form";
import { Button } from "@/components/ui/button";

export default async function AdminNewAttributePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/attributes">← Back to Attributes</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Attribute</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a new product attribute</p>
      </div>

      <AttributeForm />
    </div>
  );
}
