"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { AdminOrder } from "@/types/admin";
import { updateOrderStatus, updatePaymentStatus } from "../../actions/orders";

interface OrderActionsProps {
  order: AdminOrder;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

const PAYMENT_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
] as const;

export function OrderActions({ order }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handlePaymentChange(status: string) {
    startTransition(async () => {
      const result = await updatePaymentStatus(order.id, status);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  const isTerminal = order.status === "cancelled" || order.status === "refunded";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
          <MoreIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isTerminal}>Update Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                disabled={opt.value === order.status}
                onClick={() => handleStatusChange(opt.value)}
                className={
                  opt.value === "cancelled" || opt.value === "refunded"
                    ? "text-destructive focus:text-destructive"
                    : undefined
                }
              >
                {opt.label}
                {opt.value === order.status && " (current)"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Update Payment</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {PAYMENT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                disabled={opt.value === order.paymentStatus}
                onClick={() => handlePaymentChange(opt.value)}
              >
                {opt.label}
                {opt.value === order.paymentStatus && " (current)"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoreIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
