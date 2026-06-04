interface OrderStatusData {
  customerName: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
}

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: "Your order has been confirmed and is being prepared.",
  processing: "Your order is now being processed and will be shipped soon.",
  shipped: "Great news! Your order has been shipped and is on its way.",
  delivered: "Your order has been delivered. We hope you enjoy your purchase!",
  cancelled: "Your order has been cancelled. If you have questions, please contact us.",
  refunded:
    "A refund has been initiated for your order. It may take a few business days to appear.",
};

function capitalizeStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getOrderStatusUpdatedHtml(data: OrderStatusData): string {
  const message =
    STATUS_MESSAGES[data.newStatus] ?? `Your order status has been updated to ${data.newStatus}.`;

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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #e4e4e7;">
          <tr>
            <td>
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#09090b;">Order Update</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#71717a;">Hi ${data.customerName}, here's an update on your order.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;padding:16px;background:#f4f4f5;border-radius:8px;">
                <tr>
                  <td style="font-size:12px;color:#71717a;">Order Number</td>
                  <td style="font-size:14px;font-weight:600;color:#09090b;text-align:right;">${data.orderNumber}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#71717a;padding-top:8px;">Status</td>
                  <td style="font-size:14px;font-weight:600;color:#09090b;text-align:right;padding-top:8px;">${capitalizeStatus(data.newStatus)}</td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#09090b;">${message}</p>

              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;">If you have any questions, just reply to this email. Thank you for shopping with DollarShop!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
