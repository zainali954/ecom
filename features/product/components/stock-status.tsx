import { Badge } from "@/components/ui/badge";

interface StockStatusProps {
  stock: number;
  lowStockThreshold?: number;
}

export function StockStatus({ stock, lowStockThreshold = 5 }: StockStatusProps) {
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Out of stock
      </Badge>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
        >
          Low stock
        </Badge>
        <span className="text-xs text-muted-foreground">Only {stock} left</span>
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs"
    >
      In stock
    </Badge>
  );
}
