"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AddressSelector } from "./address-selector";
import { PaymentMethodSelector } from "./payment-method-selector";
import { OrderSummary } from "./order-summary";
import { placeOrder } from "../actions";
import type { CartData } from "@/types/cart";
import type { AddressDetail } from "@/types/address";
import type { PaymentMethod } from "@/types/checkout";

interface CheckoutFormProps {
  cart: CartData;
  addresses: AddressDetail[];
}

export function CheckoutForm({ cart, addresses }: CheckoutFormProps) {
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    startTransition(async () => {
      const result = await placeOrder({
        addressId: selectedAddressId,
        paymentMethod,
        notes,
      });

      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        {/* Shipping Address */}
        <section>
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select where you want your order delivered
          </p>
          <div className="mt-4">
            <AddressSelector
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
            />
          </div>
        </section>

        <Separator />

        {/* Payment Method */}
        <section>
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose how you want to pay</p>
          <div className="mt-4">
            <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
          </div>
        </section>

        <Separator />

        {/* Order Notes */}
        <section>
          <Label htmlFor="order-notes" className="text-lg font-semibold">
            Order Notes
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Any special instructions for your order (optional)
          </p>
          <Textarea
            id="order-notes"
            placeholder="e.g., Leave at the gate, call before delivery..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            className="mt-3"
            rows={3}
          />
        </section>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <OrderSummary cart={cart} />

          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={isPending || !selectedAddressId || addresses.length === 0}
          >
            {isPending ? "Placing Order..." : "Place Order"}
          </Button>

          <Button variant="outline" className="w-full" size="sm" asChild>
            <Link href="/cart">Back to Cart</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
