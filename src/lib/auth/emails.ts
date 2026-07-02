import { sendEmail } from "@/lib/email";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  token: string;
  locale: string;
}) {
  const verifyUrl = `${getAppUrl()}/${input.locale}/verify-email?token=${input.token}`;

  await sendEmail({
    to: input.to,
    subject: input.locale === "bg" ? "Потвърдете вашия имейл" : "Verify your email",
    html:
      input.locale === "bg"
        ? `<p>Здравейте, ${input.name}!</p><p>Моля, потвърдете вашия имейл, като отворите следния линк:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
        : `<p>Hello, ${input.name}!</p><p>Please verify your email by opening this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  token: string;
  locale: string;
}) {
  const resetUrl = `${getAppUrl()}/${input.locale}/reset-password?token=${input.token}`;

  await sendEmail({
    to: input.to,
    subject: input.locale === "bg" ? "Нулиране на парола" : "Reset your password",
    html:
      input.locale === "bg"
        ? `<p>Здравейте, ${input.name}!</p><p>За да нулирате паролата си, отворете следния линк:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        : `<p>Hello, ${input.name}!</p><p>To reset your password, open this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}
