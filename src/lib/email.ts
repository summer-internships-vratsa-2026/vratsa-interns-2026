import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.info("[email:dev]", { to, subject, html });
    return { id: "dev-mode" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not set");
  }

  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}
