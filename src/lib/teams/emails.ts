import { sendEmail } from "@/lib/email";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}

export function buildTeamJoinUrl(locale: string, token: string): string {
  return `${getAppUrl()}/${locale}/team/join?token=${token}`;
}

export async function sendTeamInviteEmail(input: {
  to: string;
  teamName: string;
  token: string;
  locale: string;
}) {
  const joinUrl = buildTeamJoinUrl(input.locale, input.token);

  await sendEmail({
    to: input.to,
    subject:
      input.locale === "bg"
        ? `Покана за отбор ${input.teamName}`
        : `Invitation to team ${input.teamName}`,
    html:
      input.locale === "bg"
        ? `<p>Бяхте поканени да се присъедините към отбор <strong>${input.teamName}</strong>.</p><p><a href="${joinUrl}">${joinUrl}</a></p>`
        : `<p>You were invited to join team <strong>${input.teamName}</strong>.</p><p><a href="${joinUrl}">${joinUrl}</a></p>`,
  });
}
