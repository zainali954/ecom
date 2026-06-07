import { emailLayout, emailButton, emailHeading, emailText, emailSmallText } from "./layout";

export function getResetPasswordHtml(resetUrl: string): string {
  const content = `
    ${emailHeading("Reset your password")}
    ${emailText("We received a request to reset your ShopRehan account password. Click the button below to choose a new one.")}
    ${emailButton(resetUrl, "Reset Password")}
    ${emailSmallText("This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.")}
  `;

  return emailLayout(content, "Reset your ShopRehan password");
}
