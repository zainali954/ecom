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
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:14px;color:#09090b;">
            ${item.name}${item.variantLabel ? `<br/><span style="font-size:12px;color:#71717a;">${item.variantLabel}</span>` : ""}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:14px;color:#71717a;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:14px;color:#09090b;text-align:right;">${formatPrice(item.totalPrice)}</td>
        </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #e4e4e7;">
          <tr>
            <td>
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#09090b;">Order Confirmed!</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#71717a;">Hi ${data.customerName}, thank you for your order. We've received it and will begin processing shortly.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;padding:16px;background:#f4f4f5;border-radius:8px;">
                <tr>
                  <td style="font-size:12px;color:#71717a;">Order Number</td>
                  <td style="font-size:14px;font-weight:600;color:#09090b;text-align:right;">${data.orderNumber}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#71717a;padding-top:8px;">Payment</td>
                  <td style="font-size:14px;color:#09090b;text-align:right;padding-top:8px;">${data.paymentMethod}</td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <th style="padding:8px 0;border-bottom:2px solid #e4e4e7;font-size:12px;font-weight:500;color:#71717a;text-align:left;">Item</th>
                  <th style="padding:8px 0;border-bottom:2px solid #e4e4e7;font-size:12px;font-weight:500;color:#71717a;text-align:center;">Qty</th>
                  <th style="padding:8px 0;border-bottom:2px solid #e4e4e7;font-size:12px;font-weight:500;color:#71717a;text-align:right;">Price</th>
                </tr>
                ${itemRows}
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#71717a;">Subtotal</td>
                  <td style="padding:4px 0;font-size:13px;color:#09090b;text-align:right;">${formatPrice(data.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#71717a;">Shipping</td>
                  <td style="padding:4px 0;font-size:13px;color:#09090b;text-align:right;">${data.shippingCost > 0 ? formatPrice(data.shippingCost) : "Free"}</td>
                </tr>
                ${data.discount > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Discount</td><td style="padding:4px 0;font-size:13px;color:#dc2626;text-align:right;">-${formatPrice(data.discount)}</td></tr>` : ""}
                <tr>
                  <td style="padding:8px 0 0;font-size:15px;font-weight:600;color:#09090b;border-top:1px solid #e4e4e7;">Total</td>
                  <td style="padding:8px 0 0;font-size:15px;font-weight:600;color:#09090b;text-align:right;border-top:1px solid #e4e4e7;">${formatPrice(data.total)}</td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;padding:16px;background:#f4f4f5;border-radius:8px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:12px;font-weight:500;color:#71717a;">Shipping To</p>
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#09090b;">${data.shippingAddress}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;">If you have any questions about your order, just reply to this email. Thank you for shopping with DollarShop!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
