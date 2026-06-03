export function getResetPasswordHtml(resetUrl: string): string {
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
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#09090b;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#71717a;">We received a request to reset your password. Click the button below to choose a new one.</p>
              <a href="${resetUrl}" style="display:inline-block;padding:10px 24px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Reset Password</a>
              <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#a1a1aa;">If you didn't request a password reset, you can safely ignore this email. This link expires in 1 hour.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
