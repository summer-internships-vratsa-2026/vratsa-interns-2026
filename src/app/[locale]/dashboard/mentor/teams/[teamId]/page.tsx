import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TeamFeedbackPanel } from "@/components/team/team-feedback-panel";
import { TeamLinksDisplay } from "@/components/team/team-links-display";
import { TeamLinksForm } from "@/components/team/team-links-form";
import { UpdateTeamForm } from "@/components/team/update-team-form";
import { Link } from "@/i18n/navigation";
import { requireMentorProfile } from "@/lib/auth/session";
import { getAdminTeamDetail } from "@/lib/teams/admin-queries";
import { getInternshipGroups, getTeamMembersWithNames } from "@/lib/teams/queries";
import { getTeamFeedbackForTeam } from "@/lib/team-feedback/queries";

type MentorTeamDetailPageProps = {
  params: Promise<{ locale: string; teamId: string }>;
};

export default async function MentorTeamDetailPage({ params }: MentorTeamDetailPageProps) {
  const { locale, teamId } = await params;
  setRequestLocale(locale);
  await requireMentorProfile(locale);

  const [teamDetail, groups, members, feedbackItems] = await Promise.all([
    getAdminTeamDetail(teamId),
    getInternshipGroups(),
    getTeamMembersWithNames(teamId),
    getTeamFeedbackForTeam(teamId),
  ]);

  if (!teamDetail) {
    notFound();
  }

  const t = await getTranslations("MentorDashboard");
  const tTeam = await getTranslations("Team");

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Link href="/dashboard/mentor/teams" className="text-sm text-muted-foreground underline">
          {t("backToTeams")}
        </Link>
        <h1 className="text-2xl font-semibold">{teamDetail.team.name}</h1>
        <p className="text-muted-foreground">
          {t("teamDetailDescription", { group: teamDetail.groupName })}
        </p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-lg font-medium">{t("sections.details")}</h2>
        <UpdateTeamForm locale={locale} team={teamDetail.team} groups={groups} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-lg font-medium">{t("sections.links")}</h2>
        <div className="mb-4">
          <TeamLinksDisplay team={teamDetail.team} />
        </div>
        <TeamLinksForm locale={locale} team={teamDetail.team} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-4 text-lg font-medium">{tTeam("members")}</h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyMembers")}</p>
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span>
                  {member.name} ({member.email})
                </span>
                <span className="text-muted-foreground">{tTeam(`roles.${member.projectRole}`)}</span>
              </li>
            ))}
          </ul>
        )}
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
