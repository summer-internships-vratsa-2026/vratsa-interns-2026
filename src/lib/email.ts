import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

function getFromAddress(): string {
  const email = process.env.RESEND_FROM_EMAIL;

  if (!email) {
    throw new Error("RESEND_FROM_EMAIL is not set");
  }

  const name = process.env.RESEND_FROM_NAME?.trim();

  if (name) {
    return `${name} <${email}>`;
  }

  return email;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.info("[email:dev]", { to, subject, html });
    return { id: "dev-mode" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
  });

  if (result.error) {
    console.error("[email:resend]", result.error);
    throw new Error(result.error.message);
  }

  return result.data;
}
