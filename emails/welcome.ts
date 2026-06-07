import {
  emailLayout,
  emailButton,
  emailHeading,
  emailText,
  emailDivider,
  emailSmallText,
  TEXT_PRIMARY,
} from "./layout";

export function getWelcomeHtml(name: string): string {
  const features = [
    { icon: "&#128722;", title: "Wide Selection", desc: "Browse thousands of quality products" },
    { icon: "&#128666;", title: "Fast Delivery", desc: "Quick shipping across Pakistan" },
    { icon: "&#128274;", title: "Secure Shopping", desc: "Safe payments and buyer protection" },
  ];

  const featuresHtml = features
    .map(
      (f) => `
    <tr>
      <td style="padding:8px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:12px;font-size:20px;">${f.icon}</td>
            <td>
              <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:${TEXT_PRIMARY};">${f.title}</p>
              <p style="margin:0;font-size:13px;color:#71717a;">${f.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`,
    )
    .join("");

  const content = `
    ${emailHeading(`Welcome to ShopRehan, ${name}!`)}
    ${emailText("Your account is all set up. We're excited to have you on board — here's what you can look forward to:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 8px;">
      ${featuresHtml}
    </table>
    ${emailDivider()}
    ${emailButton(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", "Start Shopping")}
    ${emailSmallText("Happy shopping! — The ShopRehan Team")}
  `;

  return emailLayout(content, `Welcome to ShopRehan, ${name}! Start exploring great deals.`);
}
