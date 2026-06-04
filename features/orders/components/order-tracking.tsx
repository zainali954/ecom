import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_STEPS } from "../constants";
import { cn } from "@/lib/utils";

interface OrderTrackingProps {
  status: OrderStatus;
}

const STEP_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export function OrderTracking({ status }: OrderTrackingProps) {
  const isCancelled = status === "cancelled";
  const isRefunded = status === "refunded";

  if (isCancelled || isRefunded) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
        <p className="text-sm font-medium capitalize text-destructive">Order {status}</p>
      </div>
    );
  }

  const currentIdx = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center justify-between">
      {ORDER_STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isLast = idx === ORDER_STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground/50",
                )}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium sm:text-xs",
                  isCompleted ? "text-foreground" : "text-muted-foreground/50",
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2",
                  idx < currentIdx ? "bg-primary" : "bg-muted-foreground/20",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
