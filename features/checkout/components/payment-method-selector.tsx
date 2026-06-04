"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PaymentMethod } from "@/types/checkout";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "cod", label: "Cash on Delivery", description: "Pay when you receive your order" },
  { value: "jazzcash", label: "JazzCash", description: "Pay via JazzCash mobile wallet" },
  { value: "easypaisa", label: "EasyPaisa", description: "Pay via EasyPaisa mobile wallet" },
  {
    value: "bank-transfer",
    label: "Bank Transfer",
    description: "Transfer directly to our bank account",
  },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <RadioGroup value={selected} onValueChange={(val) => onSelect(val as PaymentMethod)}>
      {PAYMENT_METHODS.map((method) => (
        <label
          key={method.value}
          htmlFor={`payment-${method.value}`}
          className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
            selected === method.value ? "border-primary bg-muted/30" : ""
          }`}
        >
          <RadioGroupItem value={method.value} id={`payment-${method.value}`} className="mt-0.5" />
          <div>
            <span className="text-sm font-medium">{method.label}</span>
            <p className="text-xs text-muted-foreground">{method.description}</p>
          </div>
        </label>
      ))}
    </RadioGroup>
  );
}
