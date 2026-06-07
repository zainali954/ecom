const BRAND_COLOR = "#e11d48";
const BRAND_COLOR_DARK = "#be123c";
const BRAND_COLOR_LIGHT = "#fff1f2";
const TEXT_PRIMARY = "#09090b";
const TEXT_SECONDARY = "#71717a";
const TEXT_MUTED = "#a1a1aa";
const BG_PAGE = "#f4f4f5";
const BG_CARD = "#ffffff";
const BORDER_COLOR = "#e4e4e7";

export {
  BRAND_COLOR,
  BRAND_COLOR_DARK,
  BRAND_COLOR_LIGHT,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BG_PAGE,
  BG_CARD,
  BORDER_COLOR,
};

export function emailLayout(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>DollarShop</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BG_PAGE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  ${preheader ? `<div style="display:none;font-size:1px;color:${BG_PAGE};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Header -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin-bottom:0;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${BRAND_COLOR};border-radius:10px;padding:8px 20px;">
                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;text-decoration:none;">DollarShop</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Content -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${BG_CARD};border-radius:12px;border:1px solid ${BORDER_COLOR};overflow:hidden;">
          <tr>
            <td style="padding:40px 32px;">
              ${content}
            </td>
          </tr>
        </table>
        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin-top:24px;">
          <tr>
            <td align="center" style="padding:0 16px;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${TEXT_MUTED};">
                &copy; ${new Date().getFullYear()} DollarShop. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:${TEXT_MUTED};">
                Fast delivery across Pakistan
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr>
    <td style="border-radius:8px;background:${BRAND_COLOR};">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.2px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

export function emailDivider(): string {
  return `<hr style="margin:24px 0;border:none;border-top:1px solid ${BORDER_COLOR};" />`;
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${TEXT_PRIMARY};line-height:1.3;">${text}</h1>`;
}

export function emailText(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:${TEXT_SECONDARY};">${text}</p>`;
}

export function emailSmallText(text: string): string {
  return `<p style="margin:0;font-size:12px;line-height:1.5;color:${TEXT_MUTED};">${text}</p>`;
}

export function emailInfoBox(content: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
  <tr>
    <td style="padding:16px 20px;background:${BRAND_COLOR_LIGHT};border-radius:8px;border-left:4px solid ${BRAND_COLOR};">
      ${content}
    </td>
  </tr>
</table>`;
}
