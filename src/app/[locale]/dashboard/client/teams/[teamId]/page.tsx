import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TeamFeedbackPanel } from "@/components/team/team-feedback-panel";
import { TeamLinksDisplay } from "@/components/team/team-links-display";
import { Link } from "@/i18n/navigation";
import { requireClientProfile } from "@/lib/auth/session";
import { getClientTeamsByUserId } from "@/lib/clients/queries";
import { getAdminTeamDetail } from "@/lib/teams/admin-queries";
import { getTeamFeedbackForTeam } from "@/lib/team-feedback/queries";

type ClientTeamDetailPageProps = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function ClientTeamDetailPage({ params }: ClientTeamDetailPageProps) {
  const { locale, teamId } = await params;
  setRequestLocale(locale);
  const { session } = await requireClientProfile(locale);
  const t = await getTranslations("ClientTeams");
  const tTasks = await getTranslations("Tasks");

  const [teamDetail, feedbackItems, clientTeams] = await Promise.all([
    getAdminTeamDetail(teamId),
    getTeamFeedbackForTeam(teamId),
    getClientTeamsByUserId(session.user.id),
  ]);

  const hasAccess = clientTeams.some((team) => team.id === teamId);

  if (!teamDetail || !hasAccess) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{teamDetail.team.name}</h1>
        <p className="text-muted-foreground">
          {t("groupLabel", { group: teamDetail.groupName })}
        </p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-lg font-medium">{t("sections.members")}</h2>
        {teamDetail.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyMembers")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {teamDetail.members.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{member.name}</span>
                <span className="text-muted-foreground">{tTasks(`roles.${member.projectRole}`)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-lg font-medium">{t("sections.links")}</h2>
        <TeamLinksDisplay team={teamDetail.team} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">{t("sections.submissions")}</h2>
          <Link
            href={`/dashboard/client/submissions?teamId=${teamId}`}
            className="text-sm underline"
          >
            {t("viewSubmissions")}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{t("submissionsHint")}</p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <TeamFeedbackPanel
          locale={locale}
          teamId={teamId}
          feedbackItems={feedbackItems}
          canCreate
          canComment
          canMarkDone={false}
        />
      </div>
    </section>
  );
}
