export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "bank-transfer";

export interface PlaceOrderInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface OrderResult {
  orderId: string;
  orderNumber: string;
}
