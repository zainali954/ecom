import { emailLayout, emailButton, emailHeading, emailText, emailSmallText } from "./layout";

export function getChangePasswordHtml(changeUrl: string): string {
  const content = `
    ${emailHeading("Change your password")}
    ${emailText("You requested to change your ShopRehan account password. Click the button below to set a new password.")}
    ${emailButton(changeUrl, "Change Password")}
    ${emailSmallText("This link expires in 1 hour. If you didn't request this change, you can safely ignore this email — your password will remain unchanged.")}
  `;

  return emailLayout(content, "Change your ShopRehan password");
}
