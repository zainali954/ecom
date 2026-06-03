import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

export function CategoryCard({ name, slug, image, productCount }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group relative flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-colors hover:bg-accent"
    >
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" sizes="64px" />
        ) : (
          <span className="text-2xl font-semibold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium">{name}</h3>
        {productCount != null && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        )}
      </div>
    </Link>
  );
}
