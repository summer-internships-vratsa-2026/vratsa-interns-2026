import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TeamFeedbackPanel } from "@/components/team/team-feedback-panel";
import { TeamLinksDisplay } from "@/components/team/team-links-display";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getAdminTeamDetail } from "@/lib/teams/admin-queries";
import { getClientTeamsByUserId, getTeamFeedbackForTeam } from "@/lib/team-feedback/queries";

type ClientTeamDetailPageProps = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function ClientTeamDetailPage({ params }: ClientTeamDetailPageProps) {
  const { locale, teamId } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "CLIENT");
  const t = await getTranslations("ClientTeams");

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
        <Link href="/dashboard/client/teams" className="text-sm text-zinc-500 underline">
          {t("backToTeams")}
        </Link>
        <h1 className="text-2xl font-semibold">{teamDetail.team.name}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {t("groupLabel", { group: teamDetail.groupName })}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("sections.links")}</h2>
        <TeamLinksDisplay team={teamDetail.team} />
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
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
