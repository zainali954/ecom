import { getCart } from "@/features/cart/queries";
import { getUserAddresses } from "@/features/address/queries";
import type { CartData } from "@/types/cart";
import type { AddressDetail } from "@/types/address";

export interface CheckoutData {
  cart: CartData;
  addresses: AddressDetail[];
}

export async function getCheckoutData(): Promise<CheckoutData> {
  const [cart, addresses] = await Promise.all([getCart(), getUserAddresses()]);
  return { cart, addresses };
}
