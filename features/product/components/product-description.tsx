import { Separator } from "@/components/ui/separator";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) return null;

  return (
    <div className="space-y-4">
      <Separator />
      <div>
        <h2 className="text-lg font-semibold">Description</h2>
        <div className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {description}
        </div>
      </div>
    </div>
  );
}
