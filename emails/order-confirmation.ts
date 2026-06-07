import {
  emailLayout,
  emailHeading,
  emailText,
  emailSmallText,
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_COLOR,
} from "./layout";

interface OrderConfirmationItem {
  name: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
}

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString("en-PK")}`;
}

export function getOrderConfirmationHtml(data: OrderConfirmationData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER_COLOR};font-size:14px;color:${TEXT_PRIMARY};">
          <strong>${item.name}</strong>
          ${item.variantLabel ? `<br/><span style="font-size:12px;color:${TEXT_SECONDARY};">${item.variantLabel}</span>` : ""}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER_COLOR};font-size:14px;color:${TEXT_SECONDARY};text-align:center;">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER_COLOR};font-size:14px;color:${TEXT_PRIMARY};text-align:right;font-weight:500;">${formatPrice(item.totalPrice)}</td>
      </tr>`,
    )
    .join("");

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td>
          ${emailHeading("Order Confirmed! &#10003;")}
          ${emailText(`Hi ${data.customerName}, thank you for your order! We've received it and will begin processing shortly.`)}
        </td>
      </tr>
    </table>

    <!-- Order Info Banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="background:${BRAND_COLOR};padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;font-size:11px;font-weight:500;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.5px;">Order Number</p>
                <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#ffffff;">${data.orderNumber}</p>
              </td>
              <td align="right">
                <p style="margin:0;font-size:11px;font-weight:500;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.5px;">Payment</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:500;color:#ffffff;">${data.paymentMethod}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <th style="padding:8px 0;border-bottom:2px solid ${BORDER_COLOR};font-size:11px;font-weight:600;color:${TEXT_MUTED};text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
        <th style="padding:8px 0;border-bottom:2px solid ${BORDER_COLOR};font-size:11px;font-weight:600;color:${TEXT_MUTED};text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
        <th style="padding:8px 0;border-bottom:2px solid ${BORDER_COLOR};font-size:11px;font-weight:600;color:${TEXT_MUTED};text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
      </tr>
      ${itemRows}
    </table>

    <!-- Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${TEXT_SECONDARY};">Subtotal</td>
        <td style="padding:6px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${formatPrice(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${TEXT_SECONDARY};">Shipping</td>
        <td style="padding:6px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;">${data.shippingCost > 0 ? formatPrice(data.shippingCost) : '<span style="color:#16a34a;font-weight:500;">Free</span>'}</td>
      </tr>
      ${data.discount > 0 ? `<tr><td style="padding:6px 0;font-size:13px;color:${TEXT_SECONDARY};">Discount</td><td style="padding:6px 0;font-size:13px;color:#dc2626;font-weight:500;text-align:right;">-${formatPrice(data.discount)}</td></tr>` : ""}
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:${TEXT_PRIMARY};border-top:2px solid ${BORDER_COLOR};">Total</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:${BRAND_COLOR};text-align:right;border-top:2px solid ${BORDER_COLOR};">${formatPrice(data.total)}</td>
      </tr>
    </table>

    <!-- Shipping Address -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;background:${BRAND_COLOR_LIGHT};border-radius:8px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:${BRAND_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Shipping To</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:${TEXT_PRIMARY};">${data.shippingAddress}</p>
        </td>
      </tr>
    </table>

    ${emailSmallText("If you have any questions about your order, just reply to this email. Thank you for shopping with ShopRehan!")}
  `;

  return emailLayout(content, `Order ${data.orderNumber} confirmed — ShopRehan`);
}
