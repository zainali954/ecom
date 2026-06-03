import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
