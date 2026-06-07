import {
  emailLayout,
  emailButton,
  emailHeading,
  emailText,
  emailSmallText,
  emailInfoBox,
  BRAND_COLOR,
  TEXT_PRIMARY,
  TEXT_MUTED,
} from "./layout";

interface OrderStatusData {
  customerName: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
}

const STATUS_CONFIG: Record<string, { emoji: string; message: string; color: string }> = {
  confirmed: {
    emoji: "&#9989;",
    message: "Your order has been confirmed and is being prepared for processing.",
    color: "#16a34a",
  },
  processing: {
    emoji: "&#9881;&#65039;",
    message: "Your order is now being processed and will be shipped soon.",
    color: "#2563eb",
  },
  shipped: {
    emoji: "&#128666;",
    message: "Great news! Your order has been shipped and is on its way to you.",
    color: "#7c3aed",
  },
  delivered: {
    emoji: "&#127881;",
    message: "Your order has been delivered. We hope you enjoy your purchase!",
    color: "#16a34a",
  },
  cancelled: {
    emoji: "&#10060;",
    message: "Your order has been cancelled. If you have questions, please contact us.",
    color: "#dc2626",
  },
  refunded: {
    emoji: "&#128176;",
    message:
      "A refund has been initiated for your order. It may take a few business days to appear in your account.",
    color: "#ea580c",
  },
};

function capitalizeStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getOrderStatusUpdatedHtml(data: OrderStatusData): string {
  const config = STATUS_CONFIG[data.newStatus] ?? {
    emoji: "&#128230;",
    message: `Your order status has been updated to ${data.newStatus}.`,
    color: BRAND_COLOR,
  };

  const content = `
    ${emailHeading("Order Status Update")}
    ${emailText(`Hi ${data.customerName}, here's an update on your order.`)}

    <!-- Status Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="padding:20px;background:#fafafa;border-radius:8px;border:1px solid #e4e4e7;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:11px;font-weight:600;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.5px;">Order Number</td>
              <td style="font-size:14px;font-weight:700;color:${TEXT_PRIMARY};text-align:right;">${data.orderNumber}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 0;">
                <hr style="margin:0;border:none;border-top:1px solid #e4e4e7;" />
              </td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:600;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.5px;">Status</td>
              <td style="text-align:right;">
                <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;color:#ffffff;background:${config.color};">
                  ${config.emoji} ${capitalizeStatus(data.newStatus)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${emailInfoBox(`<p style="margin:0;font-size:14px;line-height:1.6;color:${TEXT_PRIMARY};">${config.message}</p>`)}

    ${emailButton(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/account/orders`, "View Order Details")}

    ${emailSmallText("If you have any questions, just reply to this email. Thank you for shopping with DollarShop!")}
  `;

  return emailLayout(content, `Order ${data.orderNumber} — ${capitalizeStatus(data.newStatus)}`);
}
