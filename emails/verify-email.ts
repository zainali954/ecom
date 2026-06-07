import { emailLayout, emailButton, emailHeading, emailText, emailSmallText } from "./layout";

export function getVerifyEmailHtml(verifyUrl: string): string {
  const content = `
    ${emailHeading("Verify your email")}
    ${emailText("Thanks for creating a DollarShop account! Click the button below to verify your email address and get started.")}
    ${emailButton(verifyUrl, "Verify Email Address")}
    ${emailSmallText("This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.")}
  `;

  return emailLayout(content, "Verify your email to activate your DollarShop account");
}
