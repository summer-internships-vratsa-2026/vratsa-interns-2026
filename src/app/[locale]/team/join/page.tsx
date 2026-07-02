import { getTranslations, setRequestLocale } from "next-intl/server";

import { JoinTeamForm } from "@/components/team/join-team-form";
import { AuthCard } from "@/components/auth/auth-card";
import { auth } from "@/auth";
import { getInviteByToken, getMemberRoles } from "@/lib/teams/queries";
import { isInviteExpired } from "@/lib/teams/invites";
import { MAX_TEAM_SIZE } from "@/lib/validations/team";

type JoinTeamPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function JoinTeamPage({ params, searchParams }: JoinTeamPageProps) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  const t = await getTranslations("Team");
  const callbackUrl = token ? `/${locale}/team/join?token=${token}` : `/${locale}/team/join`;

  if (!token) {
    return (
      <AuthCard title={t("joinTeamTitle")} description={t("joinTeamDescriptionGeneric")}>
        <p className="text-sm text-red-600">{t("errors.invalid_token")}</p>
      </AuthCard>
    );
  }

  const inviteRecord = await getInviteByToken(token);

  if (!inviteRecord) {
    return (
      <AuthCard title={t("joinTeamTitle")} description={t("joinTeamDescriptionGeneric")}>
        <p className="text-sm text-red-600">{t("errors.invalid_token")}</p>
      </AuthCard>
    );
  }

  if (isInviteExpired(inviteRecord.invite.expiresAt)) {
    return (
      <AuthCard title={t("joinTeamTitle")} description={t("joinTeamDescriptionGeneric")}>
        <p className="text-sm text-red-600">{t("errors.token_expired")}</p>
      </AuthCard>
    );
  }

  const members = await getMemberRoles(inviteRecord.team.id);

  if (members.length >= MAX_TEAM_SIZE) {
    return (
      <AuthCard title={t("joinTeamTitle")} description={t("joinTeamDescriptionGeneric")}>
        <p className="text-sm text-red-600">{t("errors.team_full")}</p>
      </AuthCard>
    );
  }

  return (
    <JoinTeamForm
      locale={locale}
      token={token}
      teamName={inviteRecord.team.name}
      isLoggedIn={!!session?.user}
      isStudent={session?.user?.role === "STUDENT"}
      callbackUrl={callbackUrl}
    />
  );
}
